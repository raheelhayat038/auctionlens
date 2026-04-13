// 1. Your Car Data (You can manually update this with cars you like from the hub)
const auctionData = [
    {
        model: "TOYOTA ALPHARD",
        chassis: "ANH20-822915",
        year: "2012",
        grade: "4.5",
        status: "LIVE",
        link: "https://auc.jpauctionhub.com/japan" // Link to the auction
    },
    {
        model: "SUZUKI EVERY",
        chassis: "DA17V-345671",
        year: "2019",
        grade: "3.5",
        status: "STARTING SOON",
        link: "https://auc.jpauctionhub.com/japan"
    }
];

// 2. Function to build the list on the screen
function displayCars() {
    const list = document.getElementById('vehicleList');
    list.innerHTML = ""; // Clear old list

    auctionData.forEach(car => {
        const carCard = `
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 active:scale-[0.98] transition-all">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-white font-black text-sm tracking-tight">${car.model}</h3>
                        <p class="text-slate-500 text-[10px] uppercase font-bold tracking-widest">${car.chassis}</p>
                    </div>
                    <span class="bg-blue-600 text-white text-[9px] px-2 py-1 rounded-lg font-black italic">GRADE ${car.grade}</span>
                </div>
                
                <div class="flex justify-between items-center mt-6">
                    <div class="text-[10px] text-slate-400 font-bold italic uppercase">${car.year} Model</div>
                    <button onclick="window.open('${car.link}', '_blank')" class="bg-white text-black text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest">
                        View Auction
                    </button>
                </div>
            </div>
        `;
        list.innerHTML += carCard;
    });
}

// 3. Simple Tab Switching Logic
const scannerView = document.getElementById('viewScanner'); // Make sure your scanner div has this ID
const vehiclesView = document.getElementById('viewVehicles');
const navScan = document.getElementById('navScanner');
const navVeh = document.getElementById('navVehicles');

navScan.addEventListener('click', () => {
    scannerView.classList.remove('hidden');
    vehiclesView.classList.add('hidden');
    navScan.classList.add('text-blue-500'); navScan.classList.remove('text-slate-500');
    navVeh.classList.add('text-slate-500'); navVeh.classList.remove('text-blue-500');
});

navVeh.addEventListener('click', () => {
    scannerView.classList.add('hidden');
    vehiclesView.classList.remove('hidden');
    navVeh.classList.add('text-blue-500'); navVeh.classList.remove('text-slate-500');
    navScan.classList.add('text-slate-500'); navScan.classList.remove('text-blue-500');
    displayCars(); // Show the cars
});
