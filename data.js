// Default demo content. The admin panel overrides this in the browser (localStorage).
window.TAS_DEFAULTS = {
  business: {
    name: "T.A.S. Engineering Co.",
    since: "1958",
    proprietor: "Mr. Mansoor",
    phones: "080-41234108, 080-41600570",
    telefax: "080-22222579",
    email: "tasenggco@yahoo.com",
    whatsapp: "",
    address: "#164/1, Sadar Patrappa Road, Bangalore 560002",
    hours: "Mon–Sat, 10 am – 8 pm",
    banner: "New stock in: S.S. 316 ball valves, ½\" to 2\". Ask for bulk rates."
  },
  lines: [
    { id: "frl", name: "FRL Units", icon: "frl", blurb: "Filter, regulator, lubricator sets for compressed-air lines." },
    { id: "pneumatic", name: "Pneumatic Accessories", icon: "pneumatic", blurb: "Push-in fittings, PU tubing, silencers, quick couplers." },
    { id: "solenoid", name: "Solenoid Valves", icon: "solenoid", blurb: "2/2 and 3/2 way valves for air, water and steam." },
    { id: "fittings", name: "Compression & Flare Fittings", icon: "fitting", blurb: "Brass and S.S. unions, elbows, tees, flare nuts." },
    { id: "meters", name: "Water Meters", icon: "meter", blurb: "Multi-jet and Woltman meters for domestic and bulk lines." },
    { id: "gauges", name: "Pressure & Temperature Gauges", icon: "gauge", blurb: "Dial gauges, glycerine-filled gauges, thermometers." },
    { id: "gm", name: "G.M. Valves", icon: "gate", blurb: "Gunmetal gate, globe and check valves." },
    { id: "boiler", name: "Boiler Mountings", icon: "boiler", blurb: "Water-level gauges, safety valves, blow-down valves." },
    { id: "ss", name: "S.S. Valves", icon: "ball", blurb: "Stainless steel ball, needle and check valves." },
    { id: "cocks", name: "Cocks & Fittings", icon: "cock", blurb: "Plug cocks, gauge cocks, drain cocks and adaptors." }
  ],
  products: [
    { id: "p1", line: "frl", name: "FRL unit, modular", sizes: "¼\" BSP, ⅜\" BSP, ½\" BSP", spec: "0–10 bar · 40 µm filter", price: 2450, showPrice: true, stock: "in" },
    { id: "p2", line: "frl", name: "Air filter regulator", sizes: "¼\" BSP, ½\" BSP", spec: "Auto drain option", price: 1650, showPrice: true, stock: "in" },
    { id: "p3", line: "pneumatic", name: "Push-in straight connector", sizes: "6 mm, 8 mm, 10 mm, 12 mm", spec: "Nickel-plated brass", price: 45, showPrice: true, stock: "in" },
    { id: "p4", line: "pneumatic", name: "PU tubing (per metre)", sizes: "6 mm, 8 mm, 10 mm", spec: "Blue / black / clear", price: 28, showPrice: true, stock: "in" },
    { id: "p5", line: "solenoid", name: "Solenoid valve 2/2 way, NC", sizes: "¼\", ½\", 1\"", spec: "Brass body · 24 V DC / 230 V AC", price: 1850, showPrice: true, stock: "in" },
    { id: "p6", line: "solenoid", name: "Solenoid valve 3/2 way", sizes: "¼\", ⅜\"", spec: "For pneumatic actuators", price: 1450, showPrice: false, stock: "order" },
    { id: "p7", line: "fittings", name: "Brass compression union", sizes: "6 mm, 8 mm, 10 mm, 12 mm, ½\"", spec: "Single ferrule", price: 120, showPrice: true, stock: "in" },
    { id: "p8", line: "fittings", name: "S.S. double-ferrule elbow", sizes: "¼\" OD, ⅜\" OD, ½\" OD", spec: "S.S. 316 · instrumentation", price: 640, showPrice: true, stock: "in" },
    { id: "p9", line: "fittings", name: "Flare nut, brass", sizes: "¼\", ⅜\", ½\"", spec: "SAE 45° flare", price: 60, showPrice: true, stock: "in" },
    { id: "p10", line: "meters", name: "Multi-jet water meter", sizes: "15 mm, 20 mm, 25 mm", spec: "Class B · dry dial", price: 1950, showPrice: true, stock: "in" },
    { id: "p11", line: "gauges", name: "Pressure gauge, 100 mm dial", sizes: "0–7 bar, 0–10 bar, 0–16 bar", spec: "½\" BSP bottom entry", price: 520, showPrice: true, stock: "in" },
    { id: "p12", line: "gauges", name: "Glycerine-filled gauge, 63 mm", sizes: "0–10 bar, 0–25 bar", spec: "S.S. case", price: 690, showPrice: true, stock: "in" },
    { id: "p13", line: "gauges", name: "Dial thermometer, bimetal", sizes: "0–120 °C, 0–200 °C", spec: "100 mm dial · S.S. stem", price: 880, showPrice: false, stock: "order" },
    { id: "p14", line: "gm", name: "G.M. gate valve", sizes: "½\", ¾\", 1\", 1½\", 2\"", spec: "Screwed ends · PN 16", price: 780, showPrice: true, stock: "in" },
    { id: "p15", line: "gm", name: "G.M. globe valve", sizes: "½\", ¾\", 1\"", spec: "For steam and water", price: 1150, showPrice: false, stock: "in" },
    { id: "p16", line: "boiler", name: "Water-level gauge set", sizes: "½\", ¾\"", spec: "Reflex / tubular glass", price: 3400, showPrice: false, stock: "order" },
    { id: "p17", line: "boiler", name: "Spring-loaded safety valve", sizes: "½\", ¾\", 1\"", spec: "Set pressure on request", price: 2600, showPrice: false, stock: "in" },
    { id: "p18", line: "ss", name: "S.S. 316 ball valve, 2-piece", sizes: "½\", ¾\", 1\", 1½\", 2\"", spec: "Screwed ends · 1000 WOG", price: 950, showPrice: true, stock: "in" },
    { id: "p19", line: "ss", name: "S.S. needle valve", sizes: "¼\", ½\"", spec: "Up to 6000 psi", price: 820, showPrice: true, stock: "in" },
    { id: "p20", line: "cocks", name: "Gauge cock, brass", sizes: "¼\", ½\"", spec: "Two-way", price: 140, showPrice: true, stock: "in" },
    { id: "p21", line: "cocks", name: "Plug cock, G.M.", sizes: "½\", ¾\", 1\"", spec: "Screwed ends", price: 460, showPrice: true, stock: "in" }
  ]
};
