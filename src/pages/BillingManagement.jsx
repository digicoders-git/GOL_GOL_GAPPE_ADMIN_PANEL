import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBills, getKitchenOrders } from '../utils/api';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
    MdSearch,
    MdFilterList,
    MdFileDownload,
    MdVisibility,
    MdReceipt,
    MdCalendarToday,
    MdPerson,
    MdKeyboardArrowDown,
    MdMoreVert,
    MdLocalPrintshop,
    MdNorthEast,
    MdSouthEast,
    MdSearchOff,
    MdAdd,
    MdClose,
    MdInsights,
    MdPayment,
    MdPieChart,
    MdShowChart,
    MdChevronLeft,
    MdChevronRight
} from 'react-icons/md';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const BillingManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 8;

    const fetchBills = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role || 'super_admin';

        try {
            setLoading(true);
            const response = role === 'kitchen_admin' ? await getKitchenOrders() : await getBills();

            if (response.data.success) {
                const mappedBills = response.data.bills.map(b => ({
                    id: b.billNumber,
                    customer: b.customer?.name || 'Walk-in Customer',
                    amount: b.totalAmount,
                    date: new Date(b.createdAt).toLocaleDateString('en-IN'),
                    time: new Date(b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    status: b.status.charAt(0).toUpperCase() + b.status.slice(1).replace(/_/g, ' '),
                    method: b.paymentMethod
                }));
                setTransactions(mappedBills);
            }
        } catch (error) {
            console.error('Error fetching bills:', error);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handleExport = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Generating Master Data Report...',
                success: 'Exported Successfully!',
                error: 'Export Failed',
            }
        );
    };

    const handleView = (tx) => {
        Swal.fire({
            title: `<span class="text-2xl backdrop-blur-xl font-black text-secondary uppercase tracking-tight">Transaction Details</span>`,
            html: `
                <div class="text-left bg-zinc-50 p-6 rounded-2xl border border-zinc-100 flex flex-col gap-3">
                    <div class="flex justify-between border-b border-zinc-200 pb-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">ID</span>
                        <span class="text-sm font-black text-secondary">${tx.id}</span>
                    </div>
                    <div class="flex justify-between border-b border-zinc-200 pb-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Customer</span>
                        <span class="text-sm font-black text-secondary">${tx.customer}</span>
                    </div>
                    <div class="flex justify-between border-b border-zinc-200 pb-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Amount</span>
                        <span class="text-lg font-black text-emerald-600">₹${tx.amount}</span>
                    </div>
                    <div class="flex justify-between border-b border-zinc-200 pb-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Date & Time</span>
                        <span class="text-sm font-black text-secondary">${tx.date} at ${tx.time}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</span>
                        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase ${tx.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : tx.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}">${tx.status}</span>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
                popup: 'rounded-[2rem] p-0 overflow-hidden',
                closeButton: 'focus:outline-none'
            }
        });
    };

    const handlePrint = (id) => {
        toast.success(`Printing Invoice #${id}`);
    };


    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.customer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // --- Chart Configurations with Full Animations ---
    const revenueChartOptions = {
        chart: {
            type: 'areaspline',
            backgroundColor: 'transparent',
            height: 350,
            style: { fontFamily: 'inherit' },
            animation: {
                duration: 2000,
                easing: 'easeOutBounce'
            }
        },
        title: { text: null },
        xAxis: {
            categories: ['Feb 01', 'Feb 02', 'Feb 03', 'Feb 04'],
            labels: {
                style: {
                    color: '#94a3b8',
                    fontWeight: '900',
                    fontSize: '10px',
                    textTransform: 'uppercase'
                }
            },
            gridLineWidth: 0,
            lineColor: '#e2e8f0',
            tickColor: '#e2e8f0'
        },
        yAxis: {
            title: { text: null },
            labels: {
                style: {
                    color: '#94a3b8',
                    fontWeight: '900',
                    fontSize: '10px'
                },
                format: '₹{value}'
            },
            gridLineColor: '#f1f5f9',
            gridLineDashStyle: 'Dash'
        },
        tooltip: {
            shared: true,
            useHTML: true,
            headerFormat: '<div style="padding: 8px; background: linear-gradient(135deg, #F97316 0%, #ea580c 100%); border-radius: 8px 8px 0 0; margin: -8px -8px 8px -8px;"><span style="font-size: 11px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1px;">{point.key}</span></div>',
            pointFormat: '<div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;"><span style="color:{point.color}; font-size: 20px;">●</span><span style="font-weight: 800; color: #1e293b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">{series.name}:</span><b style="color: #F97316; font-size: 16px; margin-left: auto;">₹{point.y}</b></div>',
            backgroundColor: '#ffffff',
            borderRadius: 16,
            borderWidth: 2,
            borderColor: '#F97316',
            shadow: {
                color: 'rgba(249, 115, 22, 0.3)',
                offsetX: 0,
                offsetY: 4,
                opacity: 0.5,
                width: 10
            },
            style: {
                padding: '12px'
            }
        },
        plotOptions: {
            areaspline: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, 'rgba(249, 115, 22, 0.3)'],
                        [1, 'rgba(249, 115, 22, 0.01)']
                    ]
                },
                lineWidth: 3,
                marker: {
                    enabled: true,
                    radius: 5,
                    fillColor: '#ffffff',
                    lineWidth: 3,
                    lineColor: '#F97316',
                    symbol: 'circle',
                    states: {
                        hover: {
                            enabled: true,
                            radius: 8,
                            lineWidth: 4,
                            animation: {
                                duration: 200
                            }
                        }
                    }
                },
                states: {
                    hover: {
                        lineWidth: 4,
                        halo: {
                            size: 10,
                            opacity: 0.25,
                            attributes: {
                                fill: '#F97316'
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000
                },
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return '₹' + this.y;
                    },
                    style: {
                        fontSize: '11px',
                        fontWeight: '900',
                        color: '#2D1B0D',
                        textOutline: '2px #ffffff'
                    },
                    y: -10
                }
            }
        },
        series: [{
            name: 'Revenue',
            data: [320, 350, 480, 520],
            color: '#F97316',
            animation: {
                duration: 2500,
                easing: 'easeOutQuart'
            }
        }],
        credits: { enabled: false }
    };

    const methodChartOptions = {
        chart: {
            type: 'pie',
            backgroundColor: 'transparent',
            height: 350,
            style: { fontFamily: 'inherit' },
            animation: {
                duration: 2000
            },
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: { text: null },
        tooltip: {
            useHTML: true,
            headerFormat: '',
            pointFormat: '<div style="text-align: center; padding: 8px;"><div style="font-weight: 900; color: #2D1B0D; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">{point.name}</div><div style="font-size: 20px; font-weight: 900; color: #F97316;">{point.percentage:.1f}%</div><div style="font-size: 11px; color: #94a3b8; font-weight: 800; margin-top: 4px;">Volume: {point.y}</div></div>',
            backgroundColor: '#ffffff',
            borderRadius: 16,
            borderWidth: 2,
            borderColor: '#F97316',
            shadow: {
                color: 'rgba(249, 115, 22, 0.3)',
                offsetX: 0,
                offsetY: 4,
                opacity: 0.5,
                width: 10
            },
            style: {
                padding: '16px'
            }
        },
        plotOptions: {
            pie: {
                innerSize: '60%',
                depth: 45,
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b><br>{point.percentage:.1f}%',
                    distance: 20,
                    style: {
                        fontWeight: '900',
                        color: '#2D1B0D',
                        textTransform: 'uppercase',
                        fontSize: '11px',
                        textOutline: '2px #ffffff',
                        letterSpacing: '0.5px'
                    },
                    connectorColor: '#94a3b8',
                    connectorWidth: 2
                },
                showInLegend: true,
                borderWidth: 3,
                borderColor: '#ffffff',
                states: {
                    hover: {
                        brightness: 0.1,
                        halo: {
                            size: 15,
                            opacity: 0.25
                        }
                    },
                    select: {
                        color: null,
                        borderColor: '#2D1B0D',
                        borderWidth: 4
                    }
                },
                point: {
                    events: {
                        mouseOver: function () {
                            this.graphic.attr({
                                translateY: -10
                            });
                        },
                        mouseOut: function () {
                            this.graphic.attr({
                                translateY: 0
                            });
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutBounce'
                }
            }
        },
        legend: {
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            itemStyle: {
                fontWeight: '900',
                fontSize: '11px',
                textTransform: 'uppercase',
                color: '#64748b',
                letterSpacing: '1px'
            },
            itemHoverStyle: {
                color: '#F97316'
            },
            itemMarginBottom: 8,
            symbolRadius: 8,
            symbolHeight: 12,
            symbolWidth: 12,
            symbolPadding: 8
        },
        series: [{
            name: 'Payment Share',
            colorByPoint: true,
            data: [
                {
                    name: 'UPI',
                    y: 850,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#F97316'],
                            [1, '#ea580c']
                        ]
                    },
                    sliced: true,
                    selected: true
                },
                {
                    name: 'Cash',
                    y: 540,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#2D1B0D'],
                            [1, '#1a0f07']
                        ]
                    }
                },
                {
                    name: 'Card',
                    y: 155,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#94a3b8'],
                            [1, '#64748b']
                        ]
                    }
                }
            ],
            animation: {
                duration: 2500
            }
        }],
        credits: { enabled: false }
    };

    return (
        <div className="space-y-8 pb-10 max-w-[1600px] mx-auto p-4 lg:p-6 bg-[#FDFCFB]" style={{ zoom: '90%' }}>
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <MdInsights size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full">Business Intelligent POS</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight">Billing Management</h1>
                    <p className="text-zinc-500 text-sm font-medium mt-0.5">Real-time transaction auditing and performance analytics.</p>
                </motion.div>

                <div className="flex items-center gap-3">
                    <button onClick={handleExport} className="bg-white border-2 border-zinc-100 p-3 rounded-xl text-secondary hover:border-primary transition-all shadow-sm group cursor-pointer">
                        <MdFileDownload size={20} className="group-hover:scale-110 transition-transform text-zinc-400 group-hover:text-primary" />
                    </button>
                    <button onClick={handleExport} className="bg-secondary text-primary px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-secondary/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
                        Export Master Data
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Net Revenue', value: '₹14,230', trend: '+12%', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <MdShowChart size={24} /> },
                    { label: 'Avg Ticket', value: '₹75', trend: '+5%', color: 'text-blue-600', bg: 'bg-blue-50', icon: <MdPayment size={24} /> },
                    { label: 'Active Orders', value: '42', trend: '+8%', color: 'text-orange-600', bg: 'bg-orange-50', icon: <MdReceipt size={24} /> },
                    { label: 'Cancellation', value: '2.4%', trend: '-3%', color: 'text-red-600', bg: 'bg-red-50', icon: <MdMoreVert size={24} /> }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm group hover:shadow-lg hover:border-primary/20 transition-all cursor-default"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-primary group-hover:text-secondary shadow-inner`}>
                                {stat.icon}
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${stat.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {stat.trend.startsWith('+') ? <MdNorthEast size={12} /> : <MdSouthEast size={12} />}
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-0.5">{stat.label}</p>
                        <h2 className="text-2xl font-black text-secondary tracking-tighter">{stat.value}</h2>
                    </motion.div>
                ))}
            </div>

            {/* Table & Analytics Container */}
            <div className="grid grid-cols-1 gap-8">

                {/* Filter & Table Area */}
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm flex flex-col lg:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full group">
                            <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Audit by Transaction ID, Customer, or Phone..."
                                className="w-full bg-zinc-50 border-2 border-transparent rounded-2xl py-3 pl-16 pr-6 font-bold text-secondary outline-none focus:border-primary focus:bg-white transition-all shadow-inner text-sm"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar py-1">
                            {['All', 'Completed', 'Pending', 'Cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${statusFilter === status ? 'bg-secondary text-primary border-secondary shadow-xl shadow-secondary/10' : 'bg-white border-zinc-50 text-zinc-400 hover:border-zinc-200'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Audit Flow</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Entity</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Timestamp</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Stage</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Volume</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Gateway</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-center">Audit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    <AnimatePresence mode='popLayout'>
                                        {paginatedTransactions.length > 0 ? (
                                            paginatedTransactions.map((tx) => (
                                                <motion.tr
                                                    key={tx.id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="group hover:bg-zinc-50/50 transition-colors text-sm"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-primary/20 group-hover:text-primary transition-all shadow-inner">
                                                                <MdReceipt size={18} />
                                                            </div>
                                                            <span className="font-black text-secondary tracking-tight italic">{tx.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-secondary text-primary rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg">
                                                                {tx.customer.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-secondary text-[11px] uppercase tracking-tight">{tx.customer}</span>
                                                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Verified User</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[12px] font-black text-secondary">{tx.date}</span>
                                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{tx.time}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                                            tx.status === 'Pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                                            }`}>
                                                            <motion.div
                                                                animate={{ scale: [1, 1.2, 1] }}
                                                                transition={{ repeat: Infinity, duration: 2 }}
                                                                className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Completed' ? 'bg-emerald-500' :
                                                                    tx.status === 'Pending' ? 'bg-orange-500' : 'bg-red-500'
                                                                    }`}
                                                            />
                                                            {tx.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xl font-black text-secondary tracking-tighter">₹{tx.amount}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <MdPayment className="text-zinc-300" size={16} />
                                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{tx.method}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => handleView(tx)} className="w-9 h-9 bg-zinc-50 hover:bg-white rounded-lg text-zinc-400 hover:text-primary hover:shadow-md transition-all border border-transparent hover:border-zinc-100 flex items-center justify-center cursor-pointer">
                                                                <MdVisibility size={18} />
                                                            </button>
                                                            <button onClick={() => handlePrint(tx.id)} className="w-9 h-9 bg-zinc-50 hover:bg-white rounded-lg text-zinc-400 hover:text-secondary hover:shadow-md transition-all border border-transparent hover:border-zinc-100 flex items-center justify-center cursor-pointer">
                                                                <MdLocalPrintshop size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="py-32 text-center">
                                                    <div className="flex flex-col items-center gap-6 opacity-40">
                                                        <MdSearchOff size={64} className="text-zinc-200" />
                                                        <div>
                                                            <h3 className="text-3xl font-black text-secondary uppercase italic">Empty Audit Log</h3>
                                                            <p className="text-sm font-bold text-zinc-500 uppercase mt-2 tracking-widest">No matching transactions found in system</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Area */}
                        {totalPages > 1 && (
                            <div className="p-5 bg-zinc-50/50 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                                    Showing <span className="text-secondary">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of <span className="text-secondary">{filteredTransactions.length}</span> Master Entries
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${currentPage === 1 ? 'border-zinc-100 text-zinc-200 cursor-not-allowed' : 'border-zinc-200 text-secondary hover:border-primary hover:text-primary'}`}
                                    >
                                        <MdChevronLeft size={20} />
                                    </button>

                                    <div className="flex gap-1.5">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl font-black text-xs transition-all shadow-sm ${currentPage === i + 1 ? 'bg-secondary text-primary shadow-lg shadow-secondary/20 scale-105 z-10' : 'bg-white border text-zinc-400 hover:border-primary hover:text-primary'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${currentPage === totalPages ? 'border-zinc-100 text-zinc-200 cursor-not-allowed' : 'border-zinc-200 text-secondary hover:border-primary hover:text-primary'}`}
                                    >
                                        <MdChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Analytics Charts Section --- */}
                <div className="space-y-6 mt-8">
                    <div className="flex items-center gap-3 mb-1 px-2">
                        <div className="w-1.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
                        <div>
                            <h3 className="text-2xl font-black text-secondary tracking-tight">Business Intelligence</h3>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Revenue performance auditing</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm group hover:shadow-lg transition-all"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                                        <MdShowChart size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-secondary uppercase text-[12px] tracking-tight">Revenue Trajectory</h4>
                                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">4-Day Velocity Audit</p>
                                    </div>
                                </div>
                                <div className="bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase">Live</div>
                            </div>
                            <HighchartsReact highcharts={Highcharts} options={revenueChartOptions} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm group hover:shadow-lg transition-all"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shadow-inner">
                                        <MdPieChart size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-secondary uppercase text-[12px] tracking-tight">Gateway Distribution</h4>
                                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Payment Channel Mix</p>
                                    </div>
                                </div>
                                <MdMoreVert className="text-zinc-300 pointer-events-none" />
                            </div>
                            <HighchartsReact highcharts={Highcharts} options={methodChartOptions} />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingManagement;
