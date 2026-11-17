import{r as i,j as e}from"./vendor-react-DX_p9SF9.js";import{L as n}from"./vendor-maps-CEYCcfFW.js";if(typeof window<"u"&&n&&n.DomUtil){const u=n.DomUtil.getPosition;n.DomUtil.getPosition=function(t){if(!t)return new n.Point(0,0);try{return u.call(this,t)||new n.Point(0,0)}catch{return new n.Point(0,0)}}}const c={lat:23.7925,lng:90.4078},L=u=>{const t=u.toLowerCase();return t.includes("maldives")||t.includes("nepal")||t.includes("bhutan")||t.includes("indonesia")?{type:"voa",label:"Visa on Arrival / Free",color:"#10b981",badgeBg:"bg-emerald-500/20 text-emerald-300 border-emerald-400/40"}:t.includes("malaysia")||t.includes("singapore")||t.includes("united arab emirates")||t.includes("dubai")||t.includes("sri lanka")||t.includes("vietnam")||t.includes("turkey")||t.includes("egypt")||t.includes("georgia")?{type:"evisa",label:"eVisa Available",color:"#38bdf8",badgeBg:"bg-sky-500/20 text-sky-300 border-sky-400/40"}:{type:"embassy",label:"Embassy / Sticker Required",color:"#f59e0b",badgeBg:"bg-amber-500/20 text-amber-300 border-amber-400/40"}},O=u=>{const t=u.toLowerCase();return t.includes("bangladesh")||t.includes("maldives")||t.includes("nepal")||t.includes("bhutan")||t.includes("sri lanka")||t.includes("india")?"South Asia":t.includes("thailand")||t.includes("malaysia")||t.includes("singapore")||t.includes("indonesia")||t.includes("vietnam")||t.includes("cambodia")||t.includes("philippines")?"Southeast Asia":t.includes("japan")||t.includes("south korea")||t.includes("china")||t.includes("taiwan")?"East Asia":t.includes("united arab emirates")||t.includes("dubai")||t.includes("saudi arabia")||t.includes("qatar")||t.includes("oman")||t.includes("turkey")||t.includes("egypt")||t.includes("jordan")?"Middle East":"Asia"},te=({destinations:u,onSelectDestination:t,onOpenQuotation:T,onQuickGenerateItinerary:J,className:P="",initialRegion:B="All",compact:$=!1})=>{const b=i.useRef(null),r=i.useRef(null),y=i.useRef(null),v=i.useRef(null),[S,M]=i.useState(B),[h,V]=i.useState("All"),[w,F]=i.useState(!0),[p,E]=i.useState(null),[X,q]=i.useState(!1),k=u.filter(s=>{const l=O(s.country),o=L(s.country),d=S==="All"||l===S,x=h==="All"||h==="voa"&&o.type==="voa"||h==="evisa"&&o.type==="evisa"||h==="embassy"&&o.type==="embassy";return d&&x});i.useEffect(()=>{if(!b.current||r.current)return;let s=null;try{b.current._leaflet_id&&delete b.current._leaflet_id;const l=n.map(b.current,{center:[18.5,95],zoom:$?3:4,minZoom:2,maxZoom:12,zoomControl:!1,attributionControl:!0});n.control.zoom({position:"bottomright"}).addTo(l),n.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',subdomains:"abcd",maxZoom:19,className:"filter invert hue-rotate-180 brightness-75 contrast-125 saturate-50"}).addTo(l);const o=n.layerGroup().addTo(l),d=n.layerGroup().addTo(l);y.current=o,v.current=d,r.current=l,q(!0),s=setTimeout(()=>{if(r.current)try{r.current.invalidateSize()}catch{}},250)}catch(l){console.error("Error initializing Leaflet map:",l)}return()=>{if(s&&clearTimeout(s),r.current){try{r.current.stop(),r.current.closePopup(),r.current.off(),r.current.remove()}catch(l){console.warn("Error during map cleanup:",l)}r.current=null,y.current=null,v.current=null}}},[$]),i.useEffect(()=>{if(!r.current||!y.current||!v.current)return;const s=r.current,l=y.current,o=v.current;try{s.stop(),l.clearLayers(),o.clearLayers()}catch{return}const d=n.divIcon({className:"custom-dhaka-marker",html:`
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 44px; height: 44px;">
          <span class="absolute -inset-1 rounded-full bg-amber-400/40 animate-ping"></span>
          <div class="relative w-10 h-10 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center shadow-2xl text-amber-300 font-bold text-xs group-hover:scale-110 transition-transform">
            <span class="text-sm">👑</span>
          </div>
          <div class="absolute -bottom-5 bg-slate-950/95 border border-amber-400/50 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg">
            Dhaka HQ
          </div>
        </div>
      `,iconSize:[44,44],iconAnchor:[22,22],popupAnchor:[0,-22]}),x=n.marker([c.lat,c.lng],{icon:d});x.bindPopup(`
      <div class="p-3 bg-slate-950 text-white rounded-2xl max-w-xs space-y-2 border border-amber-400/40">
        <div class="flex items-center gap-2">
          <span class="text-lg">🇧🇩</span>
          <div>
            <h4 class="font-bold text-sm text-amber-300">Azraq Tours & Travels</h4>
            <p class="text-[11px] text-slate-300">Dhaka, Bangladesh</p>
          </div>
        </div>
        <p class="text-[11px] text-slate-300 leading-relaxed">
          Headquarters for personalized visa processing, premium air ticketing, and Asian holiday packages.
        </p>
        <div class="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
          <span class="text-emerald-400 font-semibold flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Open 9 AM - 8 PM
          </span>
          <a href="tel:+8801851172032" class="text-sky-300 hover:underline font-bold">+880 1851-172032</a>
        </div>
      </div>
    `),l.addLayer(x),k.forEach(a=>{var z,D;let j=a.lat||((z=a.coordinates)==null?void 0:z.lat),f=a.lng||((D=a.coordinates)==null?void 0:D.lng);if(typeof j!="number"||typeof f!="number")return;const R=L(a.country),g=(p==null?void 0:p.id)===a.id,Q=n.divIcon({className:"custom-destination-marker",html:`
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 46px; height: 46px;">
            ${g?'<span class="absolute -inset-2 rounded-full bg-sky-400/50 animate-ping"></span>':""}
            <div class="relative w-9 h-9 rounded-full bg-slate-950/95 border-2 ${g?"border-sky-300 scale-110 shadow-sky-500/50":"border-sky-400/70 hover:border-amber-300 shadow-black"} flex items-center justify-center shadow-xl text-white font-bold text-xs group-hover:scale-110 transition-all duration-200" style="box-shadow: 0 0 14px ${R.color}66;">
              <span class="text-sm">${a.flag||"📍"}</span>
            </div>
            <div class="absolute -bottom-5 bg-slate-900/90 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
              ${a.name}
            </div>
          </div>
        `,iconSize:[46,46],iconAnchor:[23,23],popupAnchor:[0,-24]}),C=n.marker([j,f],{icon:Q}),U=`
        <div class="p-3.5 bg-slate-950 text-slate-100 rounded-2xl max-w-xs space-y-2.5 font-sans border border-sky-400/40 shadow-2xl">
          <!-- Thumbnail & Badges -->
          <div class="relative h-28 w-full rounded-xl overflow-hidden bg-slate-800">
            <img src="${a.imageUrl||a.thumbnailUrl}" alt="${a.name}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
            <span class="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
              ${a.flag} ${a.country}
            </span>
            <span class="absolute top-2 right-2 ${R.badgeBg} text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-sm">
              ${R.label.split(" ")[0]}
            </span>
            <span class="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
              ★ ${a.rating||4.9}
            </span>
          </div>

          <!-- Name & 10-Word Teaser -->
          <div class="space-y-1">
            <h4 class="font-bold text-sm text-white">${a.name}</h4>
            <p class="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
              ${a.description?a.description.substring(0,75)+"...":"Explore magnificent sights, curated luxury stays, and seamless flight connections."}
            </p>
          </div>

          <!-- Quick Specs Row -->
          <div class="grid grid-cols-2 gap-1 text-[10px] pt-1.5 border-t border-white/10 text-slate-300">
            <span class="text-emerald-300 truncate">🗓 ${a.bestTimeToVisit||"Nov - Mar"}</span>
            <span class="text-sky-300 font-bold text-right truncate">${a.priceRange||"BDT 45k+"}</span>
          </div>

          <!-- Direct Quotation & Details Action Buttons -->
          <div class="flex items-center gap-1.5 pt-1">
            <button id="map-quote-btn-${a.id}" class="flex-1 py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-[11px] transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer">
              <span>Quote Trip</span>
              <span class="material-symbols-outlined text-[13px]">request_quote</span>
            </button>
            <button id="map-explore-btn-${a.id}" class="py-2 px-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-400 text-sky-200 hover:text-slate-950 font-bold text-[11px] border border-sky-400/30 transition-all flex items-center justify-center cursor-pointer">
              <span>Guide</span>
            </button>
          </div>
        </div>
      `;if(C.bindPopup(U,{maxWidth:300,className:"azraq-leaflet-popup"}),C.on("click",()=>{E(a),setTimeout(()=>{const N=document.getElementById(`map-quote-btn-${a.id}`),A=document.getElementById(`map-explore-btn-${a.id}`);N&&(N.onclick=m=>{m.preventDefault(),m.stopPropagation(),T&&T(a.country||a.name)}),A&&(A.onclick=m=>{m.preventDefault(),m.stopPropagation(),t(a)})},100)}),l.addLayer(C),w){const N=[c.lat,c.lng],A=[j,f],m=(c.lat+j)/2+Math.abs(c.lng-f)*.08,W=(c.lng+f)/2,Z=[N,[m,W],A],K=n.polyline(Z,{color:g?"#38bdf8":"#0284c7",weight:g?2.5:1.2,opacity:g?.9:.4,dashArray:"4, 8"});o.addLayer(K)}})},[k,w,p,T,t]);const I=()=>{r.current&&r.current.flyTo([c.lat,c.lng],6,{duration:1.5})},_=()=>{r.current&&r.current.flyTo([18.5,95],$?3:4,{duration:1.5})},G=s=>{var d,x;E(s);const l=s.lat||((d=s.coordinates)==null?void 0:d.lat),o=s.lng||((x=s.coordinates)==null?void 0:x.lng);l&&o&&r.current&&r.current.flyTo([l,o],6,{duration:1.2})},H=["All","South Asia","Southeast Asia","East Asia","Middle East"];return e.jsxs("div",{className:`relative flex flex-col rounded-3xl overflow-hidden border border-sky-400/25 bg-slate-950 shadow-2xl ${P}`,children:[e.jsxs("div",{className:"p-3.5 sm:p-4 bg-slate-900/90 border-b border-sky-400/20 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3 z-10",children:[e.jsxs("div",{className:"flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 sm:pb-0",children:[e.jsxs("span",{className:"text-[11px] text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1",children:[e.jsx("span",{className:"material-symbols-outlined text-sm text-sky-400",children:"public"}),e.jsx("span",{children:"Region:"})]}),H.map(s=>e.jsx("button",{onClick:()=>M(s),className:`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer min-h-[34px] flex items-center ${S===s?"bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/25":"bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5"}`,children:s},s))]}),e.jsxs("div",{className:"flex items-center justify-between sm:justify-end gap-2 shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-1 bg-slate-800/80 rounded-xl px-2.5 py-1 border border-white/10",children:[e.jsx("span",{className:"text-[10px] text-slate-400 font-semibold uppercase",children:"Visa:"}),e.jsxs("select",{value:h,onChange:s=>V(s.target.value),className:"bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer",children:[e.jsx("option",{value:"All",className:"bg-slate-900",children:"All Requirements"}),e.jsx("option",{value:"voa",className:"bg-slate-900",children:"🟢 Visa on Arrival"}),e.jsx("option",{value:"evisa",className:"bg-slate-900",children:"🔵 eVisa Available"}),e.jsx("option",{value:"embassy",className:"bg-slate-900",children:"🟠 Embassy Sticker"})]})]}),e.jsxs("button",{onClick:()=>F(!w),title:"Toggle Dhaka Flight Corridors",className:`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer min-h-[36px] ${w?"bg-sky-500/20 border-sky-400/40 text-sky-300":"bg-white/5 border-white/10 text-slate-400 hover:text-white"}`,children:[e.jsx("span",{className:"material-symbols-outlined text-sm",children:"flight"}),e.jsx("span",{className:"hidden sm:inline",children:"Corridors"})]}),e.jsxs("button",{onClick:I,title:"Center on Dhaka HQ",className:"p-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[36px]",children:[e.jsx("span",{children:"🇧🇩"}),e.jsx("span",{className:"hidden sm:inline",children:"Dhaka HQ"})]}),e.jsx("button",{onClick:_,title:"Reset Map View to Full Asia",className:"p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition-all flex items-center cursor-pointer min-h-[36px]",children:e.jsx("span",{className:"material-symbols-outlined text-sm",children:"restart_alt"})})]})]}),e.jsxs("div",{className:"relative w-full h-[440px] sm:h-[500px] md:h-[560px]",children:[e.jsx("div",{ref:b,className:"w-full h-full"}),e.jsxs("div",{className:"absolute bottom-4 left-4 z-[400] max-w-[260px] sm:max-w-xs bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-sky-400/30 shadow-2xl text-[11px] text-slate-300 space-y-1.5 pointer-events-auto",children:[e.jsxs("div",{className:"flex items-center gap-1.5 text-amber-300 font-bold text-xs border-b border-white/10 pb-1",children:[e.jsx("span",{className:"material-symbols-outlined text-sm",children:"connecting_airports"}),e.jsx("span",{children:"Dhaka Flight Corridors"})]}),e.jsxs("p",{className:"text-[10px] text-slate-300 leading-snug",children:["Specializing in direct & one-stop routes: ",e.jsx("strong",{className:"text-white",children:"Dhaka ↔ Maldives"}),", ",e.jsx("strong",{className:"text-white",children:"Bangkok"}),", ",e.jsx("strong",{className:"text-white",children:"Dubai"}),", and ",e.jsx("strong",{className:"text-white",children:"Tokyo"}),"."]}),e.jsxs("div",{className:"flex flex-wrap gap-2 pt-1 text-[9px] font-semibold text-slate-400",children:[e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400"})," VoA / Free"]}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-sky-400"})," eVisa"]}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-amber-400"})," Embassy"]})]})]}),e.jsxs("div",{className:"absolute top-4 right-4 z-[400] hidden lg:flex flex-col gap-1.5 max-h-[460px] overflow-y-auto hide-scrollbar p-2 bg-slate-950/85 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl max-w-[190px]",children:[e.jsxs("div",{className:"text-[10px] font-bold text-sky-400 uppercase tracking-wider px-1 pb-1 border-b border-white/10",children:["15 Asian Wonders (",k.length,")"]}),k.map(s=>e.jsxs("button",{onClick:()=>G(s),className:`px-2.5 py-1.5 rounded-xl text-left text-xs transition-all flex items-center justify-between gap-1.5 cursor-pointer ${(p==null?void 0:p.id)===s.id?"bg-sky-500 text-slate-950 font-bold":"bg-white/5 hover:bg-white/10 text-slate-200"}`,children:[e.jsxs("span",{className:"truncate",children:[s.flag," ",s.name]}),e.jsxs("span",{className:"text-[10px] opacity-75 shrink-0",children:["★ ",s.rating||4.9]})]},s.id))]})]})]})};export{te as I};
