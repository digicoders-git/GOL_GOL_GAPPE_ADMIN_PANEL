import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Highcharts3D from 'highcharts/highcharts-3d';
import {
    MdBarChart,
    MdCalendarToday,
    MdArrowUpward,
    MdArrowDownward,
    MdSearch,
    MdDownload,
    MdLayers,
    MdPieChart,
    MdTrackChanges,
    MdBolt,
    MdTrendingUp,
    MdShowChart,
    MdTimeline,
    MdInventory,
    MdAccountBalance,
    MdFilterList,
    MdInfo
} from 'react-icons/md';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

// Initialize 3D module
if (typeof Highcharts3D === 'function') {
    Highcharts3D(Highcharts);
}

const MonthWiseStock = () => {
    const [selectedMonth, setSelectedMonth] = useState('2024-02');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleExport = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Generating Monthly Audit Report...',
                success: 'Report Exported Successfully! 📂',
                error: 'Export Failed'
            }
        );
    };

    const handlePrediction = () => {
        toast.success("Prediction Model updated based on last 6 months' data! 🤖");
    };

    const handleInfo = (item) => {
        Swal.fire({
            title: `<span class="text-2xl font-black text-secondary uppercase tracking-tight">Audit Insight</span>`,
            html: `
                <div class="text-left bg-zinc-50 p-6 rounded-2xl border border-zinc-100 flex flex-col gap-3">
                    <div class="flex justify-between border-b border-zinc-200 pb-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Item Name</span>
                        <span class="text-sm font-black text-secondary">${item.item}</span>
                    </div>
                    <div class="flex justify-between border-b border-zinc-200 pb-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loss Profile</span>
                        <span class="text-sm font-black ${parseFloat(item.loss) > 2 ? 'text-red-500' : 'text-emerald-600'}">${item.loss}</span>
                    </div>
                    <div class="flex justify-between border-b border-zinc-200 pb-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">In-Flow Qty</span>
                        <span class="text-sm font-black text-secondary">${item.qtyIn}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Valuation</span>
                        <span class="text-sm font-black text-primary">${item.valuation}</span>
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

    const monthlyStats = [
        { label: 'Total Procured', value: '₹2.4L', trend: '+15%', icon: <MdBarChart />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Consumption', value: '₹1.8L', trend: '+8%', icon: <MdBolt />, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Waste Ratio', value: '3.2%', trend: '-0.5%', icon: <MdTrackChanges />, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Net Efficiency', value: '94.8%', trend: '+2%', icon: <MdPieChart />, color: 'text-emerald-600', bg: 'bg-emerald-50' }
    ];

    const inventoryAudit = [
        { id: 1, item: 'Regular Gol Gapppa (Uncooked)', qtyIn: '50k pcs', qtyOut: '42k pcs', loss: '0.8%', valuation: '₹85,000', status: 'Stable' },
        { id: 2, item: 'Maida / Flour', qtyIn: '1200 kg', qtyOut: '1150 kg', loss: '1.2%', valuation: '₹42,000', status: 'High Use' },
        { id: 3, item: 'Cooking Oil', qtyIn: '400 Ltr', qtyOut: '380 Ltr', loss: '2.5%', valuation: '₹64,000', status: 'Optimized' },
        { id: 4, item: 'Packaging Boxes (Small)', qtyIn: '10k units', qtyOut: '9.5k units', loss: '0.5%', valuation: '₹12,000', status: 'In Demand' },
        { id: 5, item: 'Special Chaat Masala', qtyIn: '150 kg', qtyOut: '140 kg', loss: '1.0%', valuation: '₹35,000', status: 'Stable' },
    ];

    const filteredAudit = inventoryAudit.filter(item => {
        const matchesSearch = item.item.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // --- Chart Configurations with Full Animations ---
    const monthlyFlowChartOptions = {
        chart: {
            type: 'column',
            backgroundColor: 'transparent',
            height: 300,
            style: { fontFamily: 'inherit' },
            animation: {
                duration: 2000,
                easing: 'easeOutBounce'
            },
            options3d: {
                enabled: true,
                alpha: 10,
                beta: 15,
                depth: 50,
                viewDistance: 25
            }
        },
        title: { text: null },
        xAxis: {
            categories: ['Gol Gappa', 'Maida', 'Cooking Oil', 'Packaging', 'Masala'],
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
                },
                format: '₹{value}k'
            },
            gridLineColor: '#f1f5f9',
            gridLineDashStyle: 'Dash'
        },
        tooltip: {
            useHTML: true,
            headerFormat: '<div style="padding: 8px; background: linear-gradient(135deg, #F97316 0%, #ea580c 100%); border-radius: 8px 8px 0 0; margin: -8px -8px 8px -8px;"><span style="font-size: 11px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1px;">{point.key}</span></div>',
            pointFormat: '<div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;"><span style="color:{point.color}; font-size: 20px;">●</span><span style="font-weight: 800; color: #1e293b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">{series.name}:</span><b style="color: #F97316; font-size: 16px; margin-left: auto;">₹{point.y}k</b></div>',
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
            column: {
                depth: 40,
                borderRadius: 8,
                borderWidth: 0,
                grouping: true,
                dataLabels: {
                    enabled: true,
                    format: '₹{point.y}k',
                    style: {
                        fontSize: '10px',
                        fontWeight: '900',
                        color: '#2D1B0D',
                        textOutline: '2px #ffffff'
                    }
                },
                animation: {
                    duration: 2000
                },
                states: {
                    hover: {
                        brightness: 0.1,
                        borderColor: '#F97316',
                        borderWidth: 2
                    }
                }
            }
        },
        series: [{
            name: 'In-Flow',
            data: [85, 42, 64, 12, 35],
            color: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, '#10b981'],
                    [1, '#059669']
                ]
            },
            animation: {
                duration: 2500,
                easing: 'easeOutQuart'
            }
        }, {
            name: 'Out-Flow',
            data: [71, 39, 61, 11, 32],
            color: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, '#F97316'],
                    [1, '#ea580c']
                ]
            },
            animation: {
                duration: 2500,
                easing: 'easeOutQuart'
            }
        }],
        credits: { enabled: false }
    };

    const valuationChartOptions = {
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
            headerFormat: '<div style="padding: 8px; background: linear-gradient(135deg, #F97316 0%, #ea580c 100%); border-radius: 8px 8px 0 0; margin: -8px -8px 8px -8px;"><span style="font-size: 11px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1px;">{point.key}</span></div>',
            pointFormat: '<div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;"><span style="color:{point.color}; font-size: 20px;">●</span><span style="font-weight: 800; color: #1e293b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">Valuation:</span><b style="color: #F97316; font-size: 16px; margin-left: auto;">₹{point.y:,.0f}</b></div>',
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
                    format: '<b>{point.name}</b><br>{point.percentage:.1f}%',
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
            name: 'Valuation Share',
            colorByPoint: true,
            data: [
                {
                    name: 'Gol Gappa',
                    y: 85000,
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
                    name: 'Cooking Oil',
                    y: 64000,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#2D1B0D'],
                            [1, '#1a0f07']
                        ]
                    }
                },
                {
                    name: 'Maida',
                    y: 42000,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#3b82f6'],
                            [1, '#2563eb']
                        ]
                    }
                },
                {
                    name: 'Masala',
                    y: 35000,
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                        stops: [
                            [0, '#10b981'],
                            [1, '#059669']
                        ]
                    }
                },
                {
                    name: 'Packaging',
                    y: 12000,
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
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">

            {/* --- Compact Header --- */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-sm">
                            <MdLayers size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Strategic Inventory Audit</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">Month Wise Stock</h1>
                    <p className="text-zinc-500 text-[11px] font-medium">Consolidated monthly analysis for better procurement planning.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-full sm:w-auto">
                        <MdCalendarToday className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors text-lg" />
                        <input
                            type="month"
                            className="w-full bg-white border border-zinc-100 rounded-xl py-2.5 pl-12 pr-4 font-bold text-secondary text-xs outline-none focus:border-primary transition-all shadow-sm"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                    <button onClick={handleExport} className="w-full sm:w-auto bg-secondary text-primary px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-secondary/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <MdDownload size={16} />
                        Monthly Report
                    </button>
                </div>
            </div>

            {/* --- Performance Overview --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {monthlyStats.map((stat, i) => (
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
                            <h3 className="text-base font-black text-secondary tracking-tight uppercase">Monthly Flow Analysis</h3>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">In-Flow vs Out-Flow</p>
                        </div>
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-inner">
                            <MdShowChart size={18} />
                        </div>
                    </div>
                    <HighchartsReact highcharts={Highcharts} options={monthlyFlowChartOptions} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-premium"
                >
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-base font-black text-secondary tracking-tight uppercase">Valuation Distribution</h3>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Asset Allocation</p>
                        </div>
                        <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shadow-inner">
                            <MdPieChart size={18} />
                        </div>
                    </div>
                    <HighchartsReact highcharts={Highcharts} options={valuationChartOptions} />
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* --- Inventory Table --- */}
                <div className="lg:col-span-12 xl:col-span-8 bg-white rounded-[2rem] border border-zinc-100 shadow-premium overflow-hidden">
                    <div className="p-5 bg-zinc-50/50 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-black text-secondary tracking-tight uppercase">Stock Analysis</h2>
                            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mt-1">Itemized Flow Review</p>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
                            <div className="relative group flex-1 md:w-72">
                                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search inventory..."
                                    className="w-full bg-white border border-zinc-100 rounded-xl py-2.5 pl-12 pr-4 text-xs font-bold text-secondary outline-none focus:border-primary shadow-sm transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 text-[9px] font-black text-secondary uppercase tracking-widest bg-primary px-4 py-2.5 rounded-lg shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-primary/20"
                                >
                                    <MdFilterList size={14} />
                                    {statusFilter === 'All' ? 'Filter Status' : `Status: ${statusFilter}`}
                                </button>

                                <AnimatePresence>
                                    {isFilterOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-2 z-20"
                                            >
                                                {['All', 'Stable', 'High Use', 'Optimized', 'In Demand'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => {
                                                            setStatusFilter(status);
                                                            setIsFilterOpen(false);
                                                            toast.success(`Filtering by ${status}`);
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
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-100">
                                    <th className="px-6 py-3.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Item</th>
                                    <th className="px-6 py-3.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">In-Flow</th>
                                    <th className="px-6 py-3.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Out-Flow</th>
                                    <th className="px-6 py-3.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Loss %</th>
                                    <th className="px-6 py-3.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">Valuation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {filteredAudit.map((item) => (
                                    <tr key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-primary font-black border border-zinc-200 group-hover:bg-primary/10 transition-all shadow-inner text-sm">
                                                    {item.item.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-secondary text-xs uppercase tracking-tight leading-none mb-1">{item.item}</h4>
                                                    <button
                                                        onClick={() => handleInfo(item)}
                                                        className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border transition-all hover:scale-105 cursor-pointer flex items-center gap-1 ${item.status === 'High Use' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-zinc-50 border-zinc-100 text-zinc-500'
                                                            }`}>
                                                        {item.status}
                                                        <MdInfo size={10} className="opacity-70" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-zinc-600 text-sm">{item.qtyIn}</td>
                                        <td className="px-6 py-4 text-center font-bold text-zinc-600 text-sm">{item.qtyOut}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-black text-sm ${parseFloat(item.loss) > 2 ? 'text-red-500' : 'text-zinc-600'}`}>
                                                {item.loss}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-secondary text-sm">{item.valuation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- Insights Panel --- */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                    <div className="bg-secondary p-5 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black tracking-tight leading-tight mb-3">Procurement<br />Efficiency Tip</h3>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-6">
                                Weekly Maida procurement during festivals has shown 15% better price stability than daily buying.
                            </p>
                            <button onClick={handlePrediction} className="bg-primary text-secondary font-black px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-lg cursor-pointer">
                                View Prediction
                            </button>
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-premium">
                        <h3 className="text-base font-black text-secondary uppercase tracking-tight mb-6">Asset Growth</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Fixed Assets', value: '₹12.4L', percent: 75, color: 'bg-primary' },
                                { label: 'Liquid Inventory', value: '₹4.2L', percent: 45, color: 'bg-orange-400' },
                                { label: 'Operational Funds', value: '₹2.8L', percent: 25, color: 'bg-blue-400' }
                            ].map((asset, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{asset.label}</p>
                                        <span className="text-xs font-black text-secondary">{asset.value}</span>
                                    </div>
                                    <div className="h-2 bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${asset.percent}%` }}
                                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                            className={`h-full ${asset.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthWiseStock;
