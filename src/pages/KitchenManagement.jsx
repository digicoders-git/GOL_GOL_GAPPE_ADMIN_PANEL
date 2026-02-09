import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Highcharts3D from 'highcharts/highcharts-3d';
import {
    MdOutlineKitchen,
    MdSearch,
    MdLocationOn,
    MdPhone,
    MdAccessTime,
    MdPerson,
    MdSettings,
    MdTrendingUp,
    MdTimer,
    MdWhatshot,
    MdCheckCircle,
    MdError,
    MdArrowForward,
    MdSensors,
    MdPeople,
    MdLocalFireDepartment,
    MdAnalytics,
    MdViewModule,
    MdViewList,
    MdMoreVert,
    MdShowChart,
    MdPieChart,
    MdEdit,
    MdDelete,
    MdInventory
} from 'react-icons/md';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { getKitchens, getBills, deleteKitchen, updateKitchen, getKitchenInventory } from '../utils/api';
import Tooltip from '../components/common/Tooltip';

// Initialize 3D module
if (typeof Highcharts3D === 'function') {
    Highcharts3D(Highcharts);
}

const KitchenManagement = () => {
    const [kitchens, setKitchens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'grid' or 'table'
    const [chartsData, setChartsData] = useState({
        performance: { categories: [], series: [] },
        orders: { series: [] }
    });
    const [selectedKitchenInventory, setSelectedKitchenInventory] = useState(null); // Added this state
    const [inventoryLoading, setInventoryLoading] = useState(false);

    const handleViewStock = async (k) => {
        try {
            setInventoryLoading(true);
            const response = await getKitchenInventory(k.id);
            if (response.data.success) {
                const inv = response.data.inventory || [];

                Swal.fire({
                    title: `<span class="text-2xl font-black text-secondary uppercase tracking-tight italic">Inventory Telemetry</span>`,
                    html: `
                        <div class="text-left space-y-4 max-h-[60vh] overflow-y-auto px-2">
                            <div class="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex justify-between items-center sticky top-0 z-10">
                                <div>
                                    <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Source Node</p>
                                    <h4 class="text-sm font-black text-secondary uppercase italic">${k.name}</h4>
                                </div>
                                <div class="text-right">
                                    <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Active Items</p>
                                    <h4 class="text-sm font-black text-primary">${inv.length} SKU</h4>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 gap-2">
                                ${inv.length > 0 ? inv.map(item => `
                                    <div class="flex items-center gap-4 bg-white p-3 rounded-xl border border-zinc-100 hover:border-primary/20 transition-all group">
                                        <div class="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 overflow-hidden shrink-0 flex items-center justify-center">
                                            ${item.product?.thumbnail ?
                            `<img src="${item.product.thumbnail}" class="w-full h-full object-cover">` :
                            `<div class="text-zinc-300"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM4 4h16v5H4V4zm0 16v-9h16v9H4zm2-7h2v2H6v-2zm0 3h2v2H6v-2zm4-3h8v2h-8v-2zm0 3h8v2h-8v-2z"></path></svg></div>`}
                                        </div>
                                        <div class="flex-1">
                                            <h5 class="text-[10px] font-black text-secondary uppercase italic leading-none">${item.product?.name || 'Unknown Item'}</h5>
                                            <p class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">${item.product?.category || 'General'}</p>
                                        </div>
                                        <div class="text-right">
                                            <span class="px-3 py-1 bg-secondary text-primary rounded-lg font-black text-[11px] italic">
                                                ${item.quantity} ${item.product?.unit || 'Units'}
                                            </span>
                                        </div>
                                    </div>
                                `).join('') : `
                                    <div class="py-10 text-center space-y-2">
                                        <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="32" width="32" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM4 4h16v5H4V4zm0 16v-9h16v9H4zm2-7h2v2H6v-2zm0 3h2v2H6v-2zm4-3h8v2h-8v-2zm0 3h8v2h-8v-2z"></path></svg>
                                        </div>
                                        <p class="text-xs font-black text-zinc-400 uppercase tracking-widest italic">Zero Payload Assigned</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    `,
                    showConfirmButton: false,
                    showCloseButton: true,
                    width: '500px',
                    customClass: {
                        popup: 'rounded-[2.5rem] p-6',
                        closeButton: 'focus:outline-none'
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Failed to sync inventory data');
        } finally {
            setInventoryLoading(false);
        }
    };

    const fetchFleetData = async () => {
        try {
            setLoading(true);
            const [kitchenRes, billRes] = await Promise.all([
                getKitchens(),
                getBills()
            ]);

            if (kitchenRes.data.success && billRes.data.success) {
                const kitchensList = kitchenRes.data.kitchens || [];
                const bills = billRes.data.bills || [];

                const mappedKitchens = kitchensList.map(k => {
                    const kitchenBills = bills.filter(b =>
                        (b.kitchen?._id === k._id) || (b.kitchen === k._id)
                    );
                    const completed = kitchenBills.filter(b => b.status === 'Completed').length;
                    const active = kitchenBills.filter(b => ['Assigned_to_Kitchen', 'Processing', 'Ready'].includes(b.status)).length;

                    const efficiencyNum = kitchenBills.length > 0
                        ? (completed / kitchenBills.length) * 100
                        : 0;

                    const loadFactor = active > 10 ? 95 : active * 10;

                    return {
                        id: k._id,
                        name: k.name,
                        location: k.location,
                        manager: k.manager,
                        contact: k.phone,
                        status: k.status === 'Active' ? 'Active' : 'Offline',
                        orders: active,
                        performance: efficiencyNum.toFixed(1) + '%',
                        temperature: (24 + (active > 5 ? 4 : 0) + Math.random() * 2).toFixed(0) + '°C',
                        load: loadFactor + '%'
                    };
                });

                setKitchens(mappedKitchens);

                // --- Performance Chart Data ---
                const colors = [
                    { linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 }, stops: [[0, '#10b981'], [1, '#059669']] }, // Emerald
                    { linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 }, stops: [[0, '#3b82f6'], [1, '#2563eb']] }, // Blue
                    { linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 }, stops: [[0, '#F97316'], [1, '#ea580c']] }, // Orange
                    { linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 }, stops: [[0, '#8b5cf6'], [1, '#7c3aed']] }, // Purple
                    { linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 }, stops: [[0, '#f43f5e'], [1, '#e11d48']] }, // Rose
                ];

                const perfCategories = mappedKitchens.map(k => k.name);
                const efficiencySeries = mappedKitchens.map((k, idx) => ({
                    y: parseFloat(k.performance) || 0,
                    color: colors[idx % colors.length]
                }));
                const workloadSeries = mappedKitchens.map((k, idx) => ({
                    y: parseInt(k.orders) || 0,
                    color: '#e2e8f0' // Light gray for volume/load
                }));

                setChartsData(prev => ({
                    ...prev,
                    performance: {
                        categories: perfCategories,
                        series: [
                            {
                                name: 'Workload (Orders)',
                                data: workloadSeries,
                                color: '#f1f5f9',
                                zIndex: 0
                            },
                            {
                                name: 'Efficiency %',
                                data: efficiencySeries,
                                colorByPoint: true,
                                zIndex: 1
                            }
                        ]
                    }
                }));

                // --- Order Distribution Chart Data --
                const orderDistData = mappedKitchens.map((k, idx) => {
                    const totalKitchenOrders = bills.filter(b => {
                        const bKitchenId = b.kitchen?._id || b.kitchen;
                        return String(bKitchenId) === String(k.id); // Use k.id from mappedKitchens
                    }).length;

                    return {
                        name: k.name,
                        y: totalKitchenOrders,
                        color: colors[idx % colors.length],
                        sliced: idx === 0,
                        selected: idx === 0
                    };
                });

                // If total orders are 0 for all, show equal slices with colors for visual appeal
                const hasAnyOrders = orderDistData.some(d => d.y > 0);
                const finalChartData = orderDistData.map((d, idx) => ({
                    ...d,
                    y: hasAnyOrders ? d.y : 1, // Fallback to 1 if no data anywhere
                    color: colors[idx % colors.length], // Explicitly re-apply color for safety
                    dataLabels: {
                        format: `<b>{point.name}</b><br>${hasAnyOrders ? '{point.percentage:.1f}%' : '0.0%'}`
                    }
                }));

                setChartsData(prev => ({
                    ...prev,
                    orders: {
                        series: [{
                            name: 'Order Volume',
                            colorByPoint: true,
                            data: finalChartData
                        }]
                    }
                }));
            }
        } catch (error) {
            console.error('Error fetching fleet data:', error);
            toast.error('Failed to load fleet data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFleetData();
    }, []);

    const handleSettings = (k) => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: `Establishing Uplink to ${k.name}...`,
                success: 'Control Node Secured ',
                error: 'Connection Refused'
            }
        );
    };

    const handleTelemetry = (k) => {
        Swal.fire({
            title: `<span class="text-2xl font-black text-secondary uppercase tracking-tight">System Diagnostic</span>`,
            html: `
                <div class="text-left bg-zinc-50 p-6 rounded-2xl border border-zinc-100 flex flex-col gap-3">
                    <div class="flex justify-between border-b border-zinc-200 pb-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Target Node</span>
                        <span class="text-sm font-black text-secondary">${k.name}</span>
                    </div>
                    <div class="flex justify-between border-b border-zinc-200 pb-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Manager</span>
                        <span class="text-sm font-black text-secondary">${k.manager}</span>
                    </div>
                     <div class="flex justify-between border-b border-zinc-200 pb-2">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Core Temp</span>
                        <span class="text-sm font-black text-red-500">${k.temperature}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Efficiency</span>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-black text-emerald-600">${k.performance}</span>
                            <div class="w-16 h-1 bg-zinc-200 rounded-full overflow-hidden">
                                <div class="h-full bg-emerald-500" style="width: ${k.performance}"></div>
                            </div>
                        </div>
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

    const handleEdit = (kitchen) => {
        Swal.fire({
            title: 'Edit Kitchen',
            html: `
                <input id="name" class="swal2-input" placeholder="Kitchen Name" value="${kitchen.name}">
                <input id="location" class="swal2-input" placeholder="Location" value="${kitchen.location}">
                <input id="manager" class="swal2-input" placeholder="Manager Name" value="${kitchen.manager}">
                <input id="phone" class="swal2-input" placeholder="Phone" value="${kitchen.contact}">
            `,
            showCancelButton: true,
            confirmButtonText: 'Update',
            confirmButtonColor: '#F97316',
            preConfirm: () => {
                return {
                    name: document.getElementById('name').value,
                    location: document.getElementById('location').value,
                    manager: document.getElementById('manager').value,
                    phone: document.getElementById('phone').value
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await updateKitchen(kitchen.id, result.value);
                    toast.success('Kitchen updated successfully!');
                    fetchFleetData();
                } catch (error) {
                    toast.error('Failed to update kitchen');
                }
            }
        });
    };

    const handleDelete = (kitchen) => {
        Swal.fire({
            title: 'Delete Kitchen?',
            text: `Are you sure you want to delete ${kitchen.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteKitchen(kitchen.id);
                    toast.success('Kitchen deleted successfully!');
                    fetchFleetData();
                } catch (error) {
                    toast.error('Failed to delete kitchen');
                }
            }
        });
    };



    const filteredKitchens = kitchens.filter(k =>
        k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- Chart Configurations with Full Animations ---
    const performanceChartOptions = {
        chart: {
            type: 'column',
            backgroundColor: 'transparent',
            height: 320,
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
            categories: chartsData.performance.categories,
            labels: {
                style: {
                    color: '#94a3b8',
                    fontWeight: '900',
                    fontSize: '10px',
                    textTransform: 'uppercase'
                },
                rotation: -15
            },
            gridLineWidth: 0,
            lineColor: '#e2e8f0'
        },
        yAxis: {
            min: 0,
            max: 100,
            title: { text: null },
            labels: {
                style: {
                    color: '#94a3b8',
                    fontWeight: '900',
                    fontSize: '10px'
                },
                format: '{value}%'
            },
            gridLineColor: '#f1f5f9',
            gridLineDashStyle: 'Dash'
        },
        tooltip: {
            useHTML: true,
            headerFormat: '<div style="padding: 8px; background: linear-gradient(135deg, #F97316 0%, #ea580c 100%); border-radius: 8px 8px 0 0; margin: -8px -8px 8px -8px;"><span style="font-size: 11px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1px;">{point.key}</span></div>',
            pointFormat: '<div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;"><span style="color:{point.color}; font-size: 20px;">●</span><span style="font-weight: 800; color: #1e293b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">{series.name}:</span><b style="color: #F97316; font-size: 16px; margin-left: auto;">{point.y}%</b></div>',
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
                dataLabels: {
                    enabled: true,
                    format: '{point.y}%',
                    style: {
                        fontSize: '11px',
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
        series: chartsData.performance.series,
        credits: { enabled: false }
    };

    const ordersChartOptions = {
        chart: {
            type: 'pie',
            backgroundColor: 'transparent',
            height: 320,
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
        series: chartsData.orders.series,
        credits: { enabled: false }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary" style={{ zoom: '90%' }}>

            {/* --- Compact Header --- */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-sm">
                            <MdAnalytics size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Fleet Intelligence</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">Fleet Command</h1>
                    <p className="text-zinc-500 text-[11px] font-medium">Real-time operational telemetry of all production nodes.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-full sm:w-80">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors text-lg" />
                        <input
                            type="text"
                            placeholder="Search fleet nodes..."
                            className="w-full bg-white border border-zinc-100 rounded-xl py-2.5 pl-12 pr-4 font-bold text-secondary text-xs outline-none focus:border-primary transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-white p-1 rounded-xl border border-zinc-100 shadow-sm">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'bg-secondary text-primary shadow-lg' : 'text-zinc-400 hover:text-secondary'}`}
                            title="Table View"
                        >
                            <MdViewList size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-secondary text-primary shadow-lg' : 'text-zinc-400 hover:text-secondary'}`}
                            title="Grid View"
                        >
                            <MdViewModule size={20} />
                        </button>

                    </div>
                </div>
            </div>

            {/* --- Global Telemetry --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Units', value: kitchens.length.toString(), sub: 'Nodes Online', icon: <MdOutlineKitchen />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Live Orders', value: kitchens.reduce((sum, k) => sum + (parseInt(k.orders) || 0), 0).toString(), sub: 'In Processing', icon: <MdTimer />, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Avg Perf.', value: (kitchens.length > 0 ? (kitchens.reduce((sum, k) => sum + parseFloat(k.performance), 0) / kitchens.length).toFixed(1) : '0') + '%', sub: 'Fleet Grade', icon: <MdTrendingUp />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Core Temp', value: '24°C', sub: 'Stable State', icon: <MdLocalFireDepartment />, color: 'text-red-600', bg: 'bg-red-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3.5 group hover:border-primary/30 transition-all">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <h3 className="text-lg font-black text-secondary leading-none">{stat.value}</h3>
                            <p className="text-[7px] font-bold text-zinc-300 uppercase italic mt-1">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Analytics Charts --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-premium"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-secondary tracking-tight uppercase">Kitchen Performance</h3>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Efficiency Metrics by Node</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                            <MdShowChart size={20} />
                        </div>
                    </div>
                    <HighchartsReact highcharts={Highcharts} options={performanceChartOptions} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-premium"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-secondary tracking-tight uppercase">Order Distribution</h3>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Live Workload Allocation</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shadow-inner">
                            <MdPieChart size={20} />
                        </div>
                    </div>
                    <HighchartsReact
                        key={`order-dist-${chartsData.orders.series?.[0]?.data?.length || 0}`}
                        highcharts={Highcharts}
                        options={ordersChartOptions}
                    />
                </motion.div>
            </div>

            {/* --- Kitchen Terminal --- */}
            <AnimatePresence mode='wait'>
                {viewMode === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {filteredKitchens.map((kitchen) => (
                            <motion.div
                                key={kitchen.id}
                                className="bg-white rounded-[2rem] border border-zinc-100 shadow-premium p-5 group hover:border-primary/20 transition-all relative overflow-hidden"
                            >
                                <div className="relative z-10 space-y-5">
                                    {/* Unit Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-primary border border-zinc-100 group-hover:bg-primary/5 transition-colors shadow-inner">
                                                <MdOutlineKitchen size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-secondary tracking-tight uppercase italic leading-none mb-1.5">{kitchen.name}</h3>
                                                <div className="flex items-center gap-1.5">
                                                    <MdLocationOn size={10} className="text-zinc-300" />
                                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{kitchen.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${kitchen.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            kitchen.status === 'Busy' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${kitchen.status === 'Active' ? 'bg-emerald-500' :
                                                kitchen.status === 'Busy' ? 'bg-orange-500' : 'bg-red-500'
                                                } animate-pulse shadow-[0_0_8px_currentColor]`} />
                                            {kitchen.status}
                                        </div>
                                    </div>

                                    {/* Operational Telemetry */}
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 py-2">
                                        <div>
                                            <p className="text-[7px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-1">Command</p>
                                            <div className="flex items-center gap-1 text-secondary font-black text-[10px] uppercase">
                                                <MdPerson className="text-primary text-[11px]" />
                                                {kitchen.manager.split(' ')[0]}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[7px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-1">Payload</p>
                                            <div className="flex items-center gap-1 text-secondary font-black text-[10px]">
                                                <MdTimer className="text-orange-500 text-[11px]" />
                                                {kitchen.orders} Units
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[7px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-1">Efficiency</p>
                                            <div className="flex items-center gap-1 text-secondary font-black text-[10px]">
                                                <MdTrendingUp className="text-emerald-500 text-[11px]" />
                                                {kitchen.performance}
                                            </div>
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-[7px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-1">Node Temp</p>
                                            <div className="flex items-center gap-1 text-secondary font-black text-[10px]">
                                                <MdWhatshot className="text-red-500 text-[11px]" />
                                                {kitchen.temperature}
                                            </div>
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-[7px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-1">Load Factor</p>
                                            <div className="flex items-center gap-1 text-secondary font-black text-[10px]">
                                                <MdSensors className="text-blue-500 text-[11px]" />
                                                {kitchen.load}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Indicator */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[7px] font-black text-zinc-400 uppercase tracking-widest">
                                            <span>Node Capacity Load</span>
                                            <span>{kitchen.load}</span>
                                        </div>
                                        <div className="w-full h-1 bg-zinc-50 border border-zinc-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: kitchen.load }}
                                                className={`h-full rounded-full ${parseInt(kitchen.load) > 80 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
                                                    parseInt(kitchen.load) > 50 ? 'bg-orange-500' : 'bg-emerald-500'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Command Actions */}
                                    <div className="pt-4 border-t border-dashed border-zinc-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-6 h-6 rounded-lg bg-zinc-50 border border-white flex items-center justify-center text-[7px] font-black text-zinc-300 shadow-sm">
                                                        S
                                                    </div>
                                                ))}
                                                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-white flex items-center justify-center text-[6px] font-black text-primary uppercase shadow-sm">
                                                    +2
                                                </div>
                                            </div>
                                            <p className="text-[7px] font-black text-zinc-300 uppercase tracking-[0.2em]">Deployment Team</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Tooltip text="Edit Node" position="top">
                                                <button onClick={() => handleEdit(kitchen)} className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all shadow-sm border border-blue-100 cursor-pointer">
                                                    <MdEdit size={14} />
                                                </button>
                                            </Tooltip>
                                            <Tooltip text="Delete Node" position="top">
                                                <button onClick={() => handleDelete(kitchen)} className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all shadow-sm border border-red-100 cursor-pointer">
                                                    <MdDelete size={14} />
                                                </button>
                                            </Tooltip>
                                            <Tooltip text="Stock Inventory" position="top">
                                                <button onClick={() => handleViewStock(kitchen)} className="p-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl transition-all shadow-sm border border-orange-100 cursor-pointer">
                                                    <MdInventory size={14} />
                                                </button>
                                            </Tooltip>
                                            <Tooltip text="Uplink Config" position="top">
                                                <button onClick={() => handleSettings(kitchen)} className="p-2.5 bg-zinc-50 hover:bg-secondary hover:text-primary rounded-xl transition-all shadow-sm border border-zinc-100 group/btn cursor-pointer">
                                                    <MdSettings size={14} className="group-hover/btn:rotate-45 transition-transform" />
                                                </button>
                                            </Tooltip>
                                            <button onClick={() => handleTelemetry(kitchen)} className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-primary rounded-xl transition-all shadow-lg shadow-black/5 text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 cursor-pointer">
                                                Telemetry <MdArrowForward size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Decor */}
                                <MdOutlineKitchen size={180} className="absolute -top-10 -right-10 text-secondary/[0.015] -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white rounded-[2rem] border border-zinc-100 shadow-premium overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-100">
                                        <th className="px-6 py-4 text-[9px] font-black uppercase text-zinc-400 tracking-widest">Kitchen Node</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase text-zinc-400 tracking-widest">Operational Status</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase text-zinc-400 tracking-widest">Manager</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase text-zinc-400 tracking-widest text-center">Payload</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase text-zinc-400 tracking-widest text-center">Health</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase text-zinc-400 tracking-widest text-center">Load Factor</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase text-zinc-400 tracking-widest text-right">Audit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {filteredKitchens.map((kitchen) => (
                                        <tr key={kitchen.id} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-primary border border-zinc-200 shadow-inner group-hover:bg-primary/10 transition-colors">
                                                        <MdOutlineKitchen size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-secondary text-xs uppercase tracking-tight leading-none mb-1">{kitchen.name}</h4>
                                                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{kitchen.location}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${kitchen.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    kitchen.status === 'Busy' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${kitchen.status === 'Active' ? 'bg-emerald-500' :
                                                        kitchen.status === 'Busy' ? 'bg-orange-500' : 'bg-red-500'
                                                        } animate-pulse`} />
                                                    {kitchen.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-zinc-500 font-black text-[10px] uppercase">
                                                    <MdPerson className="text-primary" /> {kitchen.manager}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-black text-secondary text-xs">{kitchen.orders} <span className="text-[8px] text-zinc-300 uppercase">Units</span></span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-black text-emerald-500 text-[10px]">{kitchen.performance}</span>
                                                    <div className="w-12 h-1 bg-zinc-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: kitchen.performance }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`font-black text-[10px] ${parseInt(kitchen.load) > 80 ? 'text-red-500' : 'text-blue-500'}`}>{kitchen.load}</span>
                                                    <div className="w-12 h-1 bg-zinc-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${parseInt(kitchen.load) > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: kitchen.load }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Tooltip text="Edit" position="left">
                                                        <button onClick={() => handleEdit(kitchen)} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-all border border-blue-100 flex items-center justify-center shadow-sm cursor-pointer">
                                                            <MdEdit size={16} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip text="Delete" position="left">
                                                        <button onClick={() => handleDelete(kitchen)} className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-all border border-red-100 flex items-center justify-center shadow-sm cursor-pointer">
                                                            <MdDelete size={16} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip text="Stock" position="left">
                                                        <button onClick={() => handleViewStock(kitchen)} className="w-8 h-8 bg-orange-50 hover:bg-orange-100 rounded-lg text-orange-600 transition-all border border-orange-100 flex items-center justify-center shadow-sm cursor-pointer">
                                                            <MdInventory size={16} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip text="Config" position="left">
                                                        <button onClick={() => handleSettings(kitchen)} className="w-8 h-8 bg-zinc-50 hover:bg-white rounded-lg text-zinc-400 hover:text-primary transition-all border border-transparent hover:border-zinc-100 flex items-center justify-center shadow-sm cursor-pointer">
                                                            <MdSettings size={16} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip text="Telemetry" position="left">
                                                        <button onClick={() => handleTelemetry(kitchen)} className="w-8 h-8 bg-zinc-50 hover:bg-white rounded-lg text-zinc-400 hover:text-secondary transition-all border border-transparent hover:border-zinc-100 flex items-center justify-center shadow-sm cursor-pointer">
                                                            <MdArrowForward size={16} />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KitchenManagement;
