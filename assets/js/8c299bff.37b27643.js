"use strict";(self.webpackChunknelverse=self.webpackChunknelverse||[]).push([[1654],{2152:(e,i,n)=>{n.d(i,{A:()=>t});const t=n.p+"assets/images/prod-basic2-acaac7fab68adbe9a8f3312a74b48bfa.JPG"},5546:(e,i,n)=>{n.r(i),n.d(i,{assets:()=>d,contentTitle:()=>c,default:()=>h,frontMatter:()=>r,metadata:()=>t,toc:()=>a});const t=JSON.parse('{"id":"production/basic/music_production_basics","title":"Music Production Basics","description":"Welcome to the music production basics guide!","source":"@site/docs/production/1-basic/1_music_production_basics.md","sourceDirName":"production/1-basic","slug":"/production/basic/music_production_basics","permalink":"/docs/production/basic/music_production_basics","draft":false,"unlisted":false,"editUrl":"https://github.com/neldivad/neldivad.github.io/tree/main/docs/production/1-basic/1_music_production_basics.md","tags":[],"version":"current","lastUpdatedAt":1741872635000,"sidebarPosition":1,"frontMatter":{"sidebar_position":1,"title":"Music Production Basics","parent":"Production"},"sidebar":"tutorialSidebar","previous":{"title":"Basic (FL)","permalink":"/docs/production/basic/"},"next":{"title":"Exporting selected audio as WAV","permalink":"/docs/production/basic/exporting-wav/"}}');var o=n(4848),s=n(8453);const r={sidebar_position:1,title:"Music Production Basics",parent:"Production"},c=void 0,d={},a=[{value:"Getting Started",id:"getting-started",level:2},{value:"Production Elements",id:"production-elements",level:2},{value:"Minimal Example",id:"minimal-example",level:2},{value:"Interpreting the output",id:"interpreting-the-output",level:3},{value:"&quot;I&#39;m lost with what you doing&quot;",id:"im-lost-with-what-you-doing",level:3},{value:"What&#39;s next?",id:"whats-next",level:2}];function l(e){const i={a:"a",code:"code",h2:"h2",h3:"h3",hr:"hr",img:"img",li:"li",ol:"ol",p:"p",ul:"ul",...(0,s.R)(),...e.components},{Details:t}=i;return t||function(e,i){throw new Error("Expected "+(i?"component":"object")+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}("Details",!0),(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(i.p,{children:"Welcome to the music production basics guide!"}),"\n",(0,o.jsx)(i.h2,{id:"getting-started",children:"Getting Started"}),"\n",(0,o.jsx)(i.p,{children:"Before diving into specific elements, make sure you have:"}),"\n",(0,o.jsxs)(i.ul,{children:["\n",(0,o.jsx)(i.li,{children:"A Digital Audio Workstation (DAW) installed (e.g., FL Studio, Ableton, Logic Pro)."}),"\n",(0,o.jsx)(i.li,{children:"Basic knowledge of your DAW's interface."}),"\n",(0,o.jsx)(i.li,{children:"Basic understanding of music theory (circle of fifths, key signature, time signature, BPM)"}),"\n"]}),"\n",(0,o.jsx)(i.h2,{id:"production-elements",children:"Production Elements"}),"\n",(0,o.jsx)(i.p,{children:"Typically, any music will contain 4 elements by order of priority: drum, bass, instruments, vocals."}),"\n",(0,o.jsx)(i.p,{children:"Automation is another rabbit hole to get down to. But every composer at the very least needs to make 3 layers to finish the music."}),"\n",(0,o.jsx)(i.h2,{id:"minimal-example",children:"Minimal Example"}),"\n",(0,o.jsxs)(i.p,{children:["Go to ",(0,o.jsx)(i.a,{href:"https://gilbertlisterresearch.com/GoldenPond.html",children:"GoldenPond"})," and download the piano roll script file."]}),"\n",(0,o.jsxs)(i.p,{children:["If you don't know how to use piano roll scripts, check out the ",(0,o.jsx)(i.a,{href:"/docs/production/advanced/fl-pyscripts/",children:"piano roll scripting guide"}),". Alternatively, you can just look at the generated output and get an idea on what you need to have."]}),"\n",(0,o.jsxs)(i.p,{children:["From the script dialog, enter the following:\r\n",(0,o.jsx)(i.code,{children:"74,-94,73,9(5/2),72,-75,91, 91"})]}),"\n",(0,o.jsxs)(i.p,{children:["The minimal version is actually ",(0,o.jsx)(i.code,{children:"4,4,3,5,2,5,1,1"}),", which corresponds to the following:"]}),"\n",(0,o.jsxs)(i.ul,{children:["\n",(0,o.jsx)(i.li,{children:"4th chord > 4th chord > 3rd chord > 5th chord > 2nd chord > 5th chord > 1st chord > 1st chord"}),"\n"]}),"\n",(0,o.jsx)(t,{children:(0,o.jsxs)(i.p,{children:[(0,o.jsx)("summary",{children:"Show GoldenPond script dialog"}),"\r\n",(0,o.jsx)(i.img,{src:n(9927).A+"",width:"1066",height:"682"})]})}),"\n",(0,o.jsx)(t,{children:(0,o.jsxs)(i.p,{children:[(0,o.jsx)("summary",{children:"Show generated output"}),"\r\n",(0,o.jsx)(i.img,{src:n(2152).A+"",width:"1052",height:"636"})]})}),"\n",(0,o.jsx)(i.h3,{id:"interpreting-the-output",children:"Interpreting the output"}),"\n",(0,o.jsxs)(i.ul,{children:["\n",(0,o.jsx)(i.li,{children:"Bass is boxed in red"}),"\n",(0,o.jsx)(i.li,{children:"Instruments (chords and arpeggios in this case) is boxed in yellow."}),"\n",(0,o.jsx)(i.li,{children:'The bass notes corresponds to the "root of the chords" generated by GoldenPond.'}),"\n"]}),"\n",(0,o.jsx)(i.h3,{id:"im-lost-with-what-you-doing",children:'"I\'m lost with what you doing"'}),"\n",(0,o.jsx)(i.p,{children:"I take for granted with your ability to understand music theory and chord progressions. I will not go through what is C5, Bb5, and how chords are built."}),"\n",(0,o.jsx)(i.p,{children:'GoldenPond basically attempts to generate a sequence of progression by the "chord number" of a scale. (I-IV-V-I >> 1451 in GoldenPond).'}),"\n",(0,o.jsx)(i.p,{children:"The tutorial is to get a minimal example of how to create a convincing sounding song at the minimal input (code generated most intuitive) to raise your confidence."}),"\n",(0,o.jsx)(i.h2,{id:"whats-next",children:"What's next?"}),"\n",(0,o.jsxs)(i.ol,{children:["\n",(0,o.jsx)(i.li,{children:"Producing a good chord progression for instrumentals"}),"\n",(0,o.jsx)(i.li,{children:"Producing a good bassline"}),"\n",(0,o.jsx)(i.li,{children:"Producing a drum pattern"}),"\n",(0,o.jsx)(i.li,{children:"Producing a vocal pattern"}),"\n",(0,o.jsx)(i.li,{children:"Stitching each part into a coherent song"}),"\n",(0,o.jsx)(i.li,{children:"Mixing"}),"\n",(0,o.jsx)(i.li,{children:"Mastering"}),"\n"]}),"\n",(0,o.jsx)(i.hr,{})]})}function h(e={}){const{wrapper:i}={...(0,s.R)(),...e.components};return i?(0,o.jsx)(i,{...e,children:(0,o.jsx)(l,{...e})}):l(e)}},8453:(e,i,n)=>{n.d(i,{R:()=>r,x:()=>c});var t=n(6540);const o={},s=t.createContext(o);function r(e){const i=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(i):{...i,...e}}),[i,e])}function c(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:r(e.components),t.createElement(s.Provider,{value:i},e.children)}},9927:(e,i,n)=>{n.d(i,{A:()=>t});const t=n.p+"assets/images/prod-basic1-c96d25afd6f15345df10d6927bfd85c9.JPG"}}]);