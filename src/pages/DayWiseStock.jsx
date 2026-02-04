import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Highcharts3D from 'highcharts/highcharts-3d';
import {
    MdTrendingUp,
    MdTrendingDown,
    MdCalendarToday,
    MdSearch,
    MdFilterList,
    MdArrowUpward,
    MdArrowDownward,
    MdInventory,
    MdShowChart,
    MdPieChart,
    MdBarChart,
    MdDownload,
    MdInfo,
    MdDelete,
    MdWarning,
    MdCheckCircle,
    MdTimeline
} from 'react-icons/md';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { getProducts, getStockLogs } from '../utils/api';
import { useEffect } from 'react';

// Initialize 3D module
if (typeof Highcharts3D === 'function') {
    Highcharts3D(Highcharts);
}

const DayWiseStock = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [stockMovements, setStockMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getProducts();
            if (response.data.success) {
                const movements = response.data.products.map((p, i) => ({
                    id: p._id,
                    item: p.name,
                    opening: p.quantity, // Simplified for now
                    added: 0,
                    sold: 0,
                    balanced: p.quantity,
                    waste: 0,
                    status: p.status === 'In Stock' ? 'Surplus' : 'Deficit'
                }));
                setStockMovements(movements);
            }
        } catch (error) {
            console.error('Error fetching stock:', error);
            toast.error('Failed to load stock data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const handleExport = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Preparing Stock Movement PDF...',
                success: 'PDF Exported Successfully! ',
                error: 'Export Failed'
            }
        );
    };

    const handleInfo = (item) => {
        Swal.fire({
            title: `<span class="text-2xl font-black text-secondary uppercase tracking-tight">Stock Insight</span>`,
            html: `
                <div class="text-left bg-zinc-50 p-6 rounded-2xl border border-zinc-100 flex flex-col gap-3">
                    <div class="flex justify-between border-b border-zinc-200 pb-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Product</span>
                        <span class="text-sm font-black text-secondary">${item.item}</span>
                    </div>
                    <div class="flex justify-between border-b border-zinc-200 pb-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Net Change</span>
                        <span class="text-sm font-black ${item.status === 'Surplus' ? 'text-emerald-600' : 'text-red-500'}">
                            ${item.status === 'Surplus' ? '+' : '-'}${Math.abs(item.balanced - item.opening)} Units
                        </span>
                    </div>
                    <div class="flex justify-between border-b border-zinc-200 pb-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Waste Logged</span>
                        <span class="text-sm font-black text-orange-500">${item.waste} Units</span>
                    </div>
                    <div class="flex justify-between mt-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Condition</span>
                        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'Surplus' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}">${item.status}</span>
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



    const filteredMovements = stockMovements.filter(m => {
        const matchesSearch = m.item.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // --- Chart Configurations with Full Animations ---
    const stockTrendChartOptions = {
        chart: {
            type: 'areaspline',
            backgroundColor: 'transparent',
            height: 300,
            style: { fontFamily: 'inherit' },
            animation: {
                duration: 2000,
                easing: 'easeOutBounce'
            }
        },
        title: { text: null },
        xAxis: {
            categories: ['Gol Gappe', 'Dahi Bhalla', 'Masala Water', 'Papdi Chaat', 'Aloo Tikki'],
            labels: {
                style: {
                    color: '#94a3b8',
                    fontWeight: '900',
                    fontSize: '9px',
                    textTransform: 'uppercase'
                },
                rotation: -15
            },
            gridLineWidth: 0,
            lineColor: '#e2e8f0'
        },
        yAxis: {
            title: { text: null },
            labels: {
                style: {
                    color: '#94a3b8',
                    fontWeight: '900',
                    fontSize: '10px'
                }
            },
            gridLineColor: '#f1f5f9',
            gridLineDashStyle: 'Dash'
        },
        tooltip: {
            useHTML: true,
            headerFormat: '<div style="padding: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0; margin: -8px -8px 8px -8px;"><span style="font-size: 11px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1px;">{point.key}</span></div>',
            pointFormat: '<div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;"><span style="color:{point.color}; font-size: 20px;">●</span><span style="font-weight: 800; color: #1e293b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">{series.name}:</span><b style="color: #10b981; font-size: 16px; margin-left: auto;">{point.y} units</b></div>',
            backgroundColor: '#ffffff',
            borderRadius: 16,
            borderWidth: 2,
            borderColor: '#10B981',
            shadow: {
                color: 'rgba(16, 185, 129, 0.3)',
                offsetX: 0,
                offsetY: 4,
                opacity: 0.5,
                width: 10
            }
        },
        plotOptions: {
            areaspline: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, 'rgba(16, 185, 129, 0.3)'],
                        [1, 'rgba(16, 185, 129, 0.01)']
                    ]
                },
                lineWidth: 3,
                marker: {
                    enabled: true,
                    radius: 5,
                    fillColor: '#ffffff',
                    lineWidth: 3,
                    lineColor: '#10b981',
                    symbol: 'circle',
                    states: {
                        hover: {
                            enabled: true,
                            radius: 8,
                            lineWidth: 4
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return this.y;
                    },
                    style: {
                        fontSize: '10px',
                        fontWeight: '900',
                        color: '#2D1B0D',
                        textOutline: '2px #ffffff'
                    },
                    y: -10
                },
                animation: {
                    duration: 2000
                }
            }
        },
        series: [{
            name: 'Final Balance',
            data: [1250, 380, 85, 220, 310],
            color: '#10b981',
            animation: {
                duration: 2500,
                easing: 'easeOutQuart'
            }
        }],
        credits: { enabled: false }
    };

    const wasteAnalysisChartOptions = {
        chart: {
            type: 'pie',
            backgroundColor: 'transparent',
            height: 300,
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
            headerFormat: '<div style="padding: 8px; background: linear-gradient(135deg, #F97316 0%, #ea580c 100%); border-radius: 8px 8px 0 0; margin: -8px -8px 8px -8px;"><span style="font-size: 11px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1px;">Waste Analysis</span></div>',
            pointFormat: '<div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;"><span style="color:{point.color}; font-size: 20px;">●</span><span style="font-weight: 800; color: #1e293b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">{point.name}:</span><b style="color: #F97316; font-size: 16px; margin-left: auto;">{point.y} Units</b></div>',
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
                    format: '<b>{point.name}</b><br>{point.y}',
                    distance: 15,
                    style: {
                        fontWeight: '900',
                        color: '#2D1B0D',
                        textTransform: 'uppercase',
                        fontSize: '10px',
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
                fontSize: '10px',
                textTransform: 'uppercase',
                color: '#64748b',
                letterSpacing: '1px'
            },
            itemHoverStyle: {
                color: '#F97316'
            },
            symbolRadius: 8,
            symbolHeight: 10,
            symbolWidth: 10
        },
        series: [{
            name: 'Waste Distribution',
            colorByPoint: true,
            data: [
                {
                    name: 'Gol Gappe',
                    y: 20,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#ef4444'],
                            [1, '#dc2626']
                        ]
                    },
                    sliced: true,
                    selected: true
                },
                {
                    name: 'Aloo Tikki',
                    y: 10,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#f59e0b'],
                            [1, '#d97706']
                        ]
                    }
                },
                {
                    name: 'Dahi Bhalla',
                    y: 5,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#F97316'],
                            [1, '#ea580c']
                        ]
                    }
                },
                {
                    name: 'Papdi Chaat',
                    y: 3,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#94a3b8'],
                            [1, '#64748b']
                        ]
                    }
                },
                {
                    name: 'Masala Water',
                    y: 2,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#3b82f6'],
                            [1, '#2563eb']
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
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">

            {/* --- Compact Header --- */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-sm">
                            <MdTimeline size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Daily Stock Intelligence</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">Day Wise Stock</h1>
                    <p className="text-zinc-500 text-[11px] font-medium">Detailed movement analysis for {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-full sm:w-auto">
                        <MdCalendarToday className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors text-lg" />
                        <input
                            type="date"
                            className="w-full bg-white border border-zinc-100 rounded-xl py-2.5 pl-12 pr-4 font-bold text-secondary text-xs outline-none focus:border-primary transition-all shadow-sm"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <button onClick={handleExport} className="w-full sm:w-auto bg-secondary text-primary px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-secondary/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <MdDownload size={16} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* --- Daily Summary Cards --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Sales', value: '₹14,500', trend: '+12%', icon: <MdTrendingUp />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Total Waste', value: '40 Units', trend: '-2%', icon: <MdWarning />, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Efficiency', value: '96.4%', trend: '+0.5%', icon: <MdCheckCircle />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Inventory Value', value: '₹84,200', trend: 'Healthy', icon: <MdInventory />, color: 'text-orange-600', bg: 'bg-orange-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3.5 group hover:border-primary/30 transition-all">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <h3 className="text-lg font-black text-secondary leading-none">{stat.value}</h3>
                            <p className="text-[7px] font-bold text-zinc-300 uppercase italic mt-1">{stat.trend}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Analytics Charts --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-premium"
                >
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-base font-black text-secondary tracking-tight uppercase">Stock Balance Trend</h3>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Final Inventory Levels</p>
                        </div>
                        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                            <MdShowChart size={18} />
                        </div>
                    </div>
                    <HighchartsReact highcharts={Highcharts} options={stockTrendChartOptions} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-premium"
                >
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-base font-black text-secondary tracking-tight uppercase">Waste Analysis</h3>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Product-wise Distribution</p>
                        </div>
                        <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-600 shadow-inner">
                            <MdPieChart size={18} />
                        </div>
                    </div>
                    <HighchartsReact highcharts={Highcharts} options={wasteAnalysisChartOptions} />
                </motion.div>
            </div>

            {/* --- Stock Movement Table --- */}
            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-premium overflow-hidden">
                <div className="p-5 bg-zinc-50/50 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative group flex-1 max-w-md">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search inventory items..."
                            className="w-full bg-white border border-zinc-100 rounded-xl py-2.5 pl-12 pr-4 text-xs font-bold text-secondary outline-none focus:border-primary shadow-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 text-[9px] font-black text-secondary uppercase tracking-widest bg-primary px-4 py-2.5 rounded-lg shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-primary/20"
                        >
                            <MdFilterList size={14} />
                            {statusFilter === 'All' ? 'Filter Status' : `Status: ${statusFilter}`}
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsFilterOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-2 z-20"
                                    >
                                        {['All', 'Surplus', 'Deficit'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    setStatusFilter(status);
                                                    setIsFilterOpen(false);
                                                    toast.success(`Showing ${status} stock entries`);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 last:mb-0 cursor-pointer ${statusFilter === status
                                                    ? 'bg-secondary text-primary'
                                                    : 'hover:bg-zinc-50 text-secondary'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-100">
                                <th className="px-6 py-3.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-3.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Opening</th>
                                <th className="px-6 py-3.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Added</th>
                                <th className="px-6 py-3.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Sold</th>
                                <th className="px-6 py-3.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Balance</th>
                                <th className="px-6 py-3.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Waste</th>
                                <th className="px-6 py-3.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredMovements.map((m) => (
                                <tr key={m.id} className="group hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-primary font-black border border-zinc-200 group-hover:bg-primary/10 transition-all shadow-inner text-sm">
                                                {m.item.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-secondary text-xs uppercase tracking-tight leading-none mb-1">{m.item}</h4>
                                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Entry #{1000 + m.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-zinc-500 text-sm">{m.opening}</td>
                                    <td className="px-6 py-4 text-center font-black text-emerald-600 text-sm">+{m.added}</td>
                                    <td className="px-6 py-4 text-center font-black text-red-500 text-sm">-{m.sold}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-block px-3 py-1.5 bg-secondary text-white rounded-lg font-black text-xs shadow-sm">
                                            {m.balanced}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-orange-600 text-sm">{m.waste}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleInfo(m)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 cursor-pointer ${m.status === 'Surplus' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                                                }`}>
                                            {m.status === 'Surplus' ? <MdArrowUpward size={12} /> : <MdArrowDownward size={12} />}
                                            {m.status}
                                            <MdInfo size={12} className="ml-1 opacity-70" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-5 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-center">
                    <div className="flex bg-white p-3 rounded-xl border border-zinc-100 shadow-sm gap-3 items-center">
                        <MdInfo size={18} className="text-primary" />
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                            System auto-calibrates stock every midnight. Manual override available in settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayWiseStock;
