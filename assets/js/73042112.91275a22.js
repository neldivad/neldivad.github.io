"use strict";(self.webpackChunknelverse=self.webpackChunknelverse||[]).push([[1415],{1430:(e,t,n)=>{n.d(t,{W:()=>l});var r=n(6540),i=n(797);const c=["zero","one","two","few","many","other"];function s(e){return c.filter((t=>e.includes(t)))}const o={locale:"en",pluralForms:s(["one","other"]),select:e=>1===e?"one":"other"};function a(){const{i18n:{currentLocale:e}}=(0,i.A)();return(0,r.useMemo)((()=>{try{return function(e){const t=new Intl.PluralRules(e);return{locale:e,pluralForms:s(t.resolvedOptions().pluralCategories),select:e=>t.select(e)}}(e)}catch(t){return console.error(`Failed to use Intl.PluralRules for locale "${e}".\nDocusaurus will fallback to the default (English) implementation.\nError: ${t.message}\n`),o}}),[e])}function l(){const e=a();return{selectMessage:(t,n)=>function(e,t,n){const r=e.split("|");if(1===r.length)return r[0];r.length>n.pluralForms.length&&console.error(`For locale=${n.locale}, a maximum of ${n.pluralForms.length} plural forms are expected (${n.pluralForms.join(",")}), but the message contains ${r.length}: ${e}`);const i=n.select(t),c=n.pluralForms.indexOf(i);return r[Math.min(c,r.length-1)]}(n,t,e)}}},7499:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>a,default:()=>m,frontMatter:()=>o,metadata:()=>r,toc:()=>d});const r=JSON.parse('{"id":"mixing/advanced/index","title":"Advanced","description":"Mixing advanced","source":"@site/docs/mixing/advanced/index.mdx","sourceDirName":"mixing/advanced","slug":"/mixing/advanced/","permalink":"/docs/mixing/advanced/","draft":false,"unlisted":false,"editUrl":"https://github.com/neldivad/neldivad.github.io/tree/main/docs/mixing/advanced/index.mdx","tags":[],"version":"current","lastUpdatedAt":1741872635000,"frontMatter":{},"sidebar":"tutorialSidebar","previous":{"title":"What is Mixing?","permalink":"/docs/mixing/what_is_mixing"},"next":{"title":"Placeholder","permalink":"/docs/mixing/advanced/placeholder"}}');var i=n(4848),c=n(8453),s=n(9563);const o={},a="Advanced",l={},d=[];function u(e){const t={h1:"h1",header:"header",p:"p",...(0,c.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t.header,{children:(0,i.jsx)(t.h1,{id:"advanced",children:"Advanced"})}),"\n",(0,i.jsx)(t.p,{children:"Mixing advanced"}),"\n","\n",(0,i.jsx)(s.A,{})]})}function m(e={}){const{wrapper:t}={...(0,c.R)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(u,{...e})}):u(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>o});var r=n(6540);const i={},c=r.createContext(i);function s(e){const t=r.useContext(c);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:s(e.components),r.createElement(c.Provider,{value:t},e.children)}},9563:(e,t,n)=>{n.d(t,{A:()=>v});n(6540);var r=n(4164),i=n(3751),c=n(6289),s=n(1430),o=n(2887),a=n(539),l=n(9303);const d={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var u=n(4848);function m(e){let{href:t,children:n}=e;return(0,u.jsx)(c.A,{href:t,className:(0,r.A)("card padding--lg",d.cardContainer),children:n})}function h(e){let{href:t,icon:n,title:i,description:c}=e;return(0,u.jsxs)(m,{href:t,children:[(0,u.jsxs)(l.A,{as:"h2",className:(0,r.A)("text--truncate",d.cardTitle),title:i,children:[n," ",i]}),c&&(0,u.jsx)("p",{className:(0,r.A)("text--truncate",d.cardDescription),title:c,children:c})]})}function p(e){let{item:t}=e;const n=(0,i.Nr)(t),r=function(){const{selectMessage:e}=(0,s.W)();return t=>e(t,(0,a.T)({message:"1 item|{count} items",id:"theme.docs.DocCard.categoryDescription.plurals",description:"The default description for a category card in the generated index about how many items this category includes"},{count:t}))}();return n?(0,u.jsx)(h,{href:n,icon:"\ud83d\uddc3\ufe0f",title:t.label,description:t.description??r(t.items.length)}):null}function f(e){let{item:t}=e;const n=(0,o.A)(t.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",r=(0,i.cC)(t.docId??void 0);return(0,u.jsx)(h,{href:t.href,icon:n,title:t.label,description:t.description??r?.description})}function x(e){let{item:t}=e;switch(t.type){case"link":return(0,u.jsx)(f,{item:t});case"category":return(0,u.jsx)(p,{item:t});default:throw new Error(`unknown item type ${JSON.stringify(t)}`)}}function g(e){let{className:t}=e;const n=(0,i.$S)();return(0,u.jsx)(v,{items:n.items,className:t})}function v(e){const{items:t,className:n}=e;if(!t)return(0,u.jsx)(g,{...e});const c=(0,i.d1)(t);return(0,u.jsx)("section",{className:(0,r.A)("row",n),children:c.map(((e,t)=>(0,u.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,u.jsx)(x,{item:e})},t)))})}}}]);