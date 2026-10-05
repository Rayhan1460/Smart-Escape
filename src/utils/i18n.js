/**
 * Bilingual localization dictionary for Smart Escape (English & Bengali).
 */

export const translations = {
  en: {
    appTitle: "Smart Escape",
    appSubtitle: "Interactive Evacuation Route Simulator",
    langToggle: "বাংলা",
    currentLangName: "English",
    systemActive: "OPERATIONAL",
    simulationMode: "SIMULATION ACTIVE",
    routeFound: "SAFE ROUTE ACTIVE",
    hazardDetected: "HAZARDS DETECTED",
    noRouteWarning: "NO ESCAPE ROUTE",
    startBlockedWarning: "START LOCATION BLOCKED",

    // Section 1: Building Data
    buildingData: "Building Data",
    importJson: "Import building.json",
    dropText: "Drag & drop building.json here or",
    browseFiles: "Browse File",
    loadSample: "Load Sample Building",
    downloadJson: "Export JSON",
    buildingName: "Building Name",
    totalNodes: "Total Nodes",
    corridorsCount: "Corridors",
    openExitsCount: "Open Exits",

    // Section 2: Start Location
    startLocation: "Start Location",
    selectStartNode: "Select Room or Junction",
    selectPlaceholder: "-- Choose starting room or junction --",
    room: "Room",
    junction: "Junction",
    exit: "Exit",
    mapClickHint: "Tip: You can also click any room or junction directly on the map.",
    startIsBlocked: "Selected start location is currently blocked!",

    // Section 3: Hazard Controls
    hazardControls: "Hazard Controls",
    tabNodes: "Nodes",
    tabCorridors: "Corridors",
    tabExits: "Exits",
    block: "Block",
    unblock: "Unblock",
    close: "Close",
    reopen: "Reopen",
    statusActive: "Active",
    statusBlocked: "Blocked",
    statusOpen: "Open",
    statusClosed: "Closed",
    searchFilter: "Search by ID or label...",
    corridorFromTo: "Connects",
    costBadge: "Cost",
    allClear: "No hazards in this category.",

    // Section 4: Reset
    resetSimulation: "Reset Simulation",
    resetHelp: "Restores initial hazards & states from uploaded file",

    // Route Panel
    safeRoute: "Safe Route",
    routePathTitle: "Evacuation Node Sequence",
    destinationExit: "Destination Exit",
    totalCost: "Total Route Cost",
    corridorsTraversed: "Corridors Traversed",
    noRouteTitle: "No route available",
    noRouteDesc: "All accessible routes to open exits are severed or blocked by hazards.",
    startBlockedTitle: "Starting location blocked",
    startBlockedDesc: "The selected starting location is currently blocked by a hazard. Unblock it to recompute the route.",
    noStartSelectedTitle: "No starting location selected",
    noStartSelectedDesc: "Please select an unblocked room or junction from the dropdown or click a node on the map.",

    // Dashboard Stats
    statOpenExits: "Open Exits",
    statBlockedLocations: "Blocked Locations",
    statBlockedCorridors: "Blocked Corridors",
    statRouteCost: "Route Cost",

    // Map Legend
    legendTitle: "Map Legend",
    legendRoom: "Room",
    legendJunction: "Junction",
    legendOpenExit: "Open Exit",
    legendBlockedNode: "Blocked Node",
    legendClosedExit: "Closed Exit",
    legendNormalCorridor: "Corridor",
    legendActiveRoute: "Active Route",
    legendBlockedCorridor: "Blocked Corridor",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    resetView: "Reset View",

    // Validation & Errors
    validationTitle: "JSON Validation Error",
    closeModal: "Dismiss",
    fileParseError: "Invalid JSON syntax. Please verify the file contains valid JSON format.",
    successLoaded: "Building data loaded successfully!"
  },
  bn: {
    appTitle: "স্মার্ট এস্কেপ",
    appSubtitle: "ইন্টারেক্টিভ ইভাকুয়েশন রুট সিমুলেটর",
    langToggle: "English",
    currentLangName: "বাংলা",
    systemActive: "সক্রিয়",
    simulationMode: "সিমুলেশন চলছে",
    routeFound: "নিরাপদ রুট সক্রিয়",
    hazardDetected: "বিপদ চিহ্নিত",
    noRouteWarning: "কোনো নিরাপদ রুট নেই",
    startBlockedWarning: "শুরুর অবস্থান অবরুদ্ধ",

    // Section 1: Building Data
    buildingData: "বিল্ডিং ডেটা",
    importJson: "building.json ইমপোর্ট করুন",
    dropText: "এখানে building.json ড্রপ করুন অথবা",
    browseFiles: "ফাইল বাছুন",
    loadSample: "নমুনা বিল্ডিং লোড করুন",
    downloadJson: "JSON এক্সপোর্ট করুন",
    buildingName: "ভবনের নাম",
    totalNodes: "মোট নোড",
    corridorsCount: "করিডোর সংখ্যা",
    openExitsCount: "উন্মুক্ত প্রস্থানদ্বার",

    // Section 2: Start Location
    startLocation: "শুরুর অবস্থান",
    selectStartNode: "রুম বা সংযোগস্থল নির্বাচন করুন",
    selectPlaceholder: "-- শুরুর রুম বা সংযোগ নির্বাচন করুন --",
    room: "রুম",
    junction: "সংযোগস্থল",
    exit: "প্রস্থানদ্বার",
    mapClickHint: "পরামর্শ: আপনি সরাসরি ম্যাপের যেকোনো রুম বা সংযোগস্থলেও ক্লিক করতে পারেন।",
    startIsBlocked: "নির্বাচিত শুরুর অবস্থানটি বর্তমানে অবরুদ্ধ!",

    // Section 3: Hazard Controls
    hazardControls: "বিপদ ও প্রতিবন্ধকতা নিয়ন্ত্রণ",
    tabNodes: "নোডসমূহ",
    tabCorridors: "করিডোরসমূহ",
    tabExits: "প্রস্থানদ্বারসমূহ",
    block: "অবরুদ্ধ করুন",
    unblock: "মুক্ত করুন",
    close: "বন্ধ করুন",
    reopen: "পুনরায় খুলুন",
    statusActive: "সক্রিয়",
    statusBlocked: "অবরুদ্ধ",
    statusOpen: "খোলা",
    statusClosed: "বন্ধ",
    searchFilter: "আইডি বা নাম দিয়ে খুঁজুন...",
    corridorFromTo: "সংযোগ",
    costBadge: "ব্যয়",
    allClear: "এই বিভাগে কোনো বিপদ নেই।",

    // Section 4: Reset
    resetSimulation: "সিমুলেশন রিসেট করুন",
    resetHelp: "আপলোড করা ফাইলের আদি অবস্থা ফিরিয়ে আনবে",

    // Route Panel
    safeRoute: "নিরাপদ রুট",
    routePathTitle: "নির্গমন নোড অনুক্রম",
    destinationExit: "গন্তব্য প্রস্থানদ্বার",
    totalCost: "মোট রুট ব্যয়",
    corridorsTraversed: "অতিক্রান্ত করিডোর",
    noRouteTitle: "No route available",
    noRouteDesc: "উন্মুক্ত জরুরি প্রস্থানদ্বারে পৌঁছানোর সমস্ত পথ বন্ধ বা বিচ্ছিন্ন।",
    startBlockedTitle: "Starting location blocked",
    startBlockedDesc: "নির্বাচিত শুরুর নোডটি বর্তমানে বিপদগ্রস্ত অঞ্চলে রয়েছে। রুট গণনার জন্য এটি মুক্ত করুন।",
    noStartSelectedTitle: "কোনো শুরুর অবস্থান নির্বাচন করা হয়নি",
    noStartSelectedDesc: "অনুগ্রহ করে ড্রপডাউন থেকে বা ম্যাপে ক্লিক করে একটি রুম বা সংযোগ নির্বাচন করুন।",

    // Dashboard Stats
    statOpenExits: "উন্মুক্ত প্রস্থানদ্বার",
    statBlockedLocations: "অবরুদ্ধ স্থান",
    statBlockedCorridors: "অবরুদ্ধ করিডোর",
    statRouteCost: "রুট ব্যয়",

    // Map Legend
    legendTitle: "ম্যাপের নির্দেশিকা",
    legendRoom: "রুম",
    legendJunction: "সংযোগস্থল",
    legendOpenExit: "উন্মুক্ত প্রস্থান",
    legendBlockedNode: "অবরুদ্ধ নোড",
    legendClosedExit: "বন্ধ প্রস্থান",
    legendNormalCorridor: "করিডোর",
    legendActiveRoute: "নিরাপদ রুট",
    legendBlockedCorridor: "অবরুদ্ধ করিডোর",
    zoomIn: "জুম ইন",
    zoomOut: "জুম আউট",
    resetView: "ভিউ রিসেট",

    // Validation & Errors
    validationTitle: "JSON যাচাইকরণ ত্রুটি",
    closeModal: "বাতিল করুন",
    fileParseError: "অকার্যকর JSON ফরম্যাট। ফাইলের সিনট্যাক্স সঠিক কিনা পরীক্ষা করুন।",
    successLoaded: "বিল্ডিং ডেটা সফলভাবে লোড হয়েছে!"
  }
};
