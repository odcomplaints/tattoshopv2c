import{a as e,c as t,i as n,n as r,o as i,r as a,s as o,t as s}from"./index-CTGpZoKn.js";var c=new Uint8Array(4);function l(e){return(e&e-1)==0}var u=1,d=class{constructor(e,{image:t,target:n=e.TEXTURE_2D,type:r=e.UNSIGNED_BYTE,format:i=e.RGBA,internalFormat:a=i,wrapS:o=e.CLAMP_TO_EDGE,wrapT:s=e.CLAMP_TO_EDGE,wrapR:c=e.CLAMP_TO_EDGE,generateMipmaps:l=n===(e.TEXTURE_2D||e.TEXTURE_CUBE_MAP),minFilter:d=l?e.NEAREST_MIPMAP_LINEAR:e.LINEAR,magFilter:f=e.LINEAR,premultiplyAlpha:p=!1,unpackAlignment:m=4,flipY:h=n==(e.TEXTURE_2D||e.TEXTURE_3D),anisotropy:g=0,level:_=0,width:v,height:y=v,length:b=1}={}){this.gl=e,this.id=u++,this.image=t,this.target=n,this.type=r,this.format=i,this.internalFormat=a,this.minFilter=d,this.magFilter=f,this.wrapS=o,this.wrapT=s,this.wrapR=c,this.generateMipmaps=l,this.premultiplyAlpha=p,this.unpackAlignment=m,this.flipY=h,this.anisotropy=Math.min(g,this.gl.renderer.parameters.maxAnisotropy),this.level=_,this.width=v,this.height=y,this.length=b,this.texture=this.gl.createTexture(),this.store={image:null},this.glState=this.gl.renderer.state,this.state={},this.state.minFilter=this.gl.NEAREST_MIPMAP_LINEAR,this.state.magFilter=this.gl.LINEAR,this.state.wrapS=this.gl.REPEAT,this.state.wrapT=this.gl.REPEAT,this.state.anisotropy=0}bind(){this.glState.textureUnits[this.glState.activeTextureUnit]!==this.id&&(this.gl.bindTexture(this.target,this.texture),this.glState.textureUnits[this.glState.activeTextureUnit]=this.id)}update(e=0){let t=!(this.image===this.store.image&&!this.needsUpdate);if((t||this.glState.textureUnits[e]!==this.id)&&(this.gl.renderer.activeTexture(e),this.bind()),t){if(this.needsUpdate=!1,this.flipY!==this.glState.flipY&&(this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,this.flipY),this.glState.flipY=this.flipY),this.premultiplyAlpha!==this.glState.premultiplyAlpha&&(this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,this.premultiplyAlpha),this.glState.premultiplyAlpha=this.premultiplyAlpha),this.unpackAlignment!==this.glState.unpackAlignment&&(this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT,this.unpackAlignment),this.glState.unpackAlignment=this.unpackAlignment),this.minFilter!==this.state.minFilter&&(this.gl.texParameteri(this.target,this.gl.TEXTURE_MIN_FILTER,this.minFilter),this.state.minFilter=this.minFilter),this.magFilter!==this.state.magFilter&&(this.gl.texParameteri(this.target,this.gl.TEXTURE_MAG_FILTER,this.magFilter),this.state.magFilter=this.magFilter),this.wrapS!==this.state.wrapS&&(this.gl.texParameteri(this.target,this.gl.TEXTURE_WRAP_S,this.wrapS),this.state.wrapS=this.wrapS),this.wrapT!==this.state.wrapT&&(this.gl.texParameteri(this.target,this.gl.TEXTURE_WRAP_T,this.wrapT),this.state.wrapT=this.wrapT),this.wrapR!==this.state.wrapR&&(this.gl.texParameteri(this.target,this.gl.TEXTURE_WRAP_R,this.wrapR),this.state.wrapR=this.wrapR),this.anisotropy&&this.anisotropy!==this.state.anisotropy&&(this.gl.texParameterf(this.target,this.gl.renderer.getExtension(`EXT_texture_filter_anisotropic`).TEXTURE_MAX_ANISOTROPY_EXT,this.anisotropy),this.state.anisotropy=this.anisotropy),this.image){if(this.image.width&&(this.width=this.image.width,this.height=this.image.height),this.target===this.gl.TEXTURE_CUBE_MAP)for(let e=0;e<6;e++)this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X+e,this.level,this.internalFormat,this.format,this.type,this.image[e]);else if(ArrayBuffer.isView(this.image))this.target===this.gl.TEXTURE_2D?this.gl.texImage2D(this.target,this.level,this.internalFormat,this.width,this.height,0,this.format,this.type,this.image):(this.target===this.gl.TEXTURE_2D_ARRAY||this.target===this.gl.TEXTURE_3D)&&this.gl.texImage3D(this.target,this.level,this.internalFormat,this.width,this.height,this.length,0,this.format,this.type,this.image);else if(this.image.isCompressedTexture)for(let e=0;e<this.image.length;e++)this.gl.compressedTexImage2D(this.target,e,this.internalFormat,this.image[e].width,this.image[e].height,0,this.image[e].data);else this.target===this.gl.TEXTURE_2D?this.gl.texImage2D(this.target,this.level,this.internalFormat,this.format,this.type,this.image):this.gl.texImage3D(this.target,this.level,this.internalFormat,this.width,this.height,this.length,0,this.format,this.type,this.image);this.generateMipmaps&&(!this.gl.renderer.isWebgl2&&(!l(this.image.width)||!l(this.image.height))?(this.generateMipmaps=!1,this.wrapS=this.wrapT=this.gl.CLAMP_TO_EDGE,this.minFilter=this.gl.LINEAR):this.gl.generateMipmap(this.target)),this.onUpdate&&this.onUpdate()}else if(this.target===this.gl.TEXTURE_CUBE_MAP)for(let e=0;e<6;e++)this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,this.gl.RGBA,1,1,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,c);else this.width?this.target===this.gl.TEXTURE_2D?this.gl.texImage2D(this.target,this.level,this.internalFormat,this.width,this.height,0,this.format,this.type,null):this.gl.texImage3D(this.target,this.level,this.internalFormat,this.width,this.height,this.length,0,this.format,this.type,null):this.gl.texImage2D(this.target,0,this.gl.RGBA,1,1,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,c);this.store.image=this.image}}},f=t(i(),1),p=t(o(),1),m=e();function h(e){let t=e.replace(`#`,``);return[parseInt(t.slice(0,2),16)/255,parseInt(t.slice(2,4),16)/255,parseInt(t.slice(4,6),16)/255]}function g(e=256){let t=new Uint8Array(e*e*4);function n(e,t,n){let r=e*374761393+t*668265263+n*1274126177;return r=Math.imul(r^r>>>13,1274126177),((r^r>>>16)>>>0)/4294967296}function r(t,r,i,a){let o=t/e*i,s=r/e*i,c=Math.floor(o),l=Math.floor(s),u=o-c,d=s-l,f=i|0,p=n((c%f+f)%f,(l%f+f)%f,a),m=n(((c+1)%f+f)%f,(l%f+f)%f,a),h=n((c%f+f)%f,((l+1)%f+f)%f,a),g=n(((c+1)%f+f)%f,((l+1)%f+f)%f,a);return p*(1-u)*(1-d)+m*u*(1-d)+h*(1-u)*d+g*u*d}for(let n=0;n<e;n++)for(let i=0;i<e;i++){let a=0,o=.4,s=0;for(let e=0;e<8;e++){let t=32*(1<<e);a+=o*r(i,n,t,e*31),s+=o,o*=.65}a/=s,a=(a-.5)*2.2+.5,a=Math.max(0,Math.min(1,a));let c=Math.round(a*255),l=(n*e+i)*4;t[l]=c,t[l+1]=c,t[l+2]=c,t[l+3]=255}return t}var _=`
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`,v=`
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform sampler2D uNoiseTexture;
uniform float uPupilSize;
uniform float uIrisWidth;
uniform float uGlowIntensity;
uniform float uIntensity;
uniform float uScale;
uniform float uNoiseScale;
uniform vec2 uMouse;
uniform float uPupilFollow;
uniform float uFlameSpeed;
uniform vec3 uEyeColor;
uniform vec3 uPupilColor;
uniform vec3 uBgColor;

void main() {
  // Normalize by the shorter viewport side so the eye keeps a consistent size
  // across orientations: landscape falls back to height (desktop look stays the
  // same), portrait uses width so the eye isn't zoomed in / cropped on phones.
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
  uv /= uScale;
  float ft = uTime * uFlameSpeed;

  float polarRadius = length(uv) * 2.0;
  float polarAngle = (2.0 * atan(uv.x, uv.y)) / 6.28 * 0.3;
  vec2 polarUv = vec2(polarRadius, polarAngle);

  vec4 noiseA = texture2D(uNoiseTexture, polarUv * vec2(0.2, 7.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));
  vec4 noiseB = texture2D(uNoiseTexture, polarUv * vec2(0.3, 4.0) * uNoiseScale + vec2(-ft * 0.2, 0.0));
  vec4 noiseC = texture2D(uNoiseTexture, polarUv * vec2(0.1, 5.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));

  float distanceMask = 1.0 - length(uv);

  // Inner ring
  float innerRing = clamp(-1.0 * ((distanceMask - 0.7) / uIrisWidth), 0.0, 1.0);
  innerRing = (innerRing * distanceMask - 0.2) / 0.28;
  innerRing += noiseA.r - 0.5;
  innerRing *= 1.3;
  innerRing = clamp(innerRing, 0.0, 1.0);

  float outerRing = clamp(-1.0 * ((distanceMask - 0.5) / 0.2), 0.0, 1.0);
  outerRing = (outerRing * distanceMask - 0.1) / 0.38;
  outerRing += noiseC.r - 0.5;
  outerRing *= 1.3;
  outerRing = clamp(outerRing, 0.0, 1.0);

  innerRing += outerRing;

  // Inner eye
  float innerEye = distanceMask - 0.1 * 2.0;
  innerEye *= noiseB.r * 2.0;

  // Pupil with cursor tracking
  vec2 pupilOffset = uMouse * uPupilFollow * 0.12;
  vec2 pupilUv = uv - pupilOffset;
  float pupil = 1.0 - length(pupilUv * vec2(9.0, 2.3));
  pupil *= uPupilSize;
  pupil = clamp(pupil, 0.0, 1.0);
  pupil /= 0.35;
  float pupilFill = clamp(pupil, 0.0, 1.0);

  // Outer eye
  float outerEyeGlow = 1.0 - length(uv * vec2(0.5, 1.5));
  outerEyeGlow = clamp(outerEyeGlow + 0.5, 0.0, 1.0);
  outerEyeGlow += noiseC.r - 0.5;
  float outerBgGlow = outerEyeGlow;
  outerEyeGlow = pow(outerEyeGlow, 2.0);
  outerEyeGlow += distanceMask;
  outerEyeGlow *= uGlowIntensity;
  outerEyeGlow = clamp(outerEyeGlow, 0.0, 1.0);
  outerEyeGlow *= pow(1.0 - distanceMask, 2.0) * 2.5;

  // Outer eye bg glow
  outerBgGlow += distanceMask;
  outerBgGlow = pow(outerBgGlow, 0.5);
  outerBgGlow *= 0.15;

  vec3 eyeCol = uEyeColor * uIntensity * clamp(max(innerRing + innerEye, outerEyeGlow + outerBgGlow) - pupil, 0.0, 3.0);
  // Fill the pupil slit with its own color (e.g. a white pupil).
  vec3 color = mix(eyeCol, uPupilColor, pupilFill);
  color += uBgColor;

  gl_FragColor = vec4(color, 1.0);
}
`;function y({className:e,eyeColor:t=`#FF6F37`,intensity:i=1.5,pupilSize:o=.6,irisWidth:c=.25,glowIntensity:l=.35,scale:u=.8,noiseScale:f=1,pupilFollow:y=1,flameSpeed:b=1,pupilColor:x=`#ffffff`,backgroundColor:S=`#000000`}){let C=(0,p.useRef)(null);return(0,p.useEffect)(()=>{if(!C.current)return;let e=C.current,p=new a({alpha:!0,premultipliedAlpha:!1}),m=p.gl;m.clearColor(0,0,0,0);let w=new d(m,{image:g(256),width:256,height:256,generateMipmaps:!1,flipY:!1});w.minFilter=m.LINEAR,w.magFilter=m.LINEAR,w.wrapS=m.REPEAT,w.wrapT=m.REPEAT;let T={x:0,y:0,tx:0,ty:0},E=window.matchMedia(`(pointer: coarse)`).matches,D=Math.random()*1e3,O=!1,k=-1/0,A=-1/0;function j(e){let t=Math.sin(e*.9+D)*.5+Math.sin(e*2.1+D*1.7)*.3,n=Math.cos(e*.75+D*.6)*.4+Math.sin(e*1.6+D*2.1)*.22;return[Math.max(-.85,Math.min(.85,t)),Math.max(-.85,Math.min(.85,n))]}function M(t){let n=e.getBoundingClientRect();T.tx=(t.clientX-n.left)/n.width*2-1,T.ty=-((t.clientY-n.top)/n.height*2-1),A=performance.now()}function N(){T.tx=0,T.ty=0,A=-1/0}function P(t){let n=t.touches[0];if(!n)return;let r=e.getBoundingClientRect();T.tx=(n.clientX-r.left)/r.width*2-1,T.ty=-((n.clientY-r.top)/r.height*2-1),O=!0,k=performance.now()}function F(){O=!1,k=performance.now()}window.addEventListener(`mousemove`,M),document.addEventListener(`mouseleave`,N),window.addEventListener(`touchstart`,P,{passive:!0}),window.addEventListener(`touchmove`,P,{passive:!0}),window.addEventListener(`touchend`,F),window.addEventListener(`touchcancel`,F);let I;function L(){p.setSize(e.offsetWidth,e.offsetHeight),I&&(I.uniforms.uResolution.value=[m.canvas.width,m.canvas.height,m.canvas.width/m.canvas.height])}window.addEventListener(`resize`,L),L();let R=new s(m);I=new n(m,{vertex:_,fragment:v,uniforms:{uTime:{value:0},uResolution:{value:[m.canvas.width,m.canvas.height,m.canvas.width/m.canvas.height]},uNoiseTexture:{value:w},uPupilSize:{value:o},uIrisWidth:{value:c},uGlowIntensity:{value:l},uIntensity:{value:i},uScale:{value:u},uNoiseScale:{value:f},uMouse:{value:[0,0]},uPupilFollow:{value:y},uFlameSpeed:{value:b},uEyeColor:{value:h(t)},uPupilColor:{value:h(x)},uBgColor:{value:h(S)}}});let z=new r(m,{geometry:R,program:I});e.appendChild(m.canvas);let B;function V(e){if(B=requestAnimationFrame(V),E?!O&&e-k>900:e-A>1200){let[t,n]=j(e*.001);T.tx=t,T.ty=n}let t=E?.12:.05;T.x+=(T.tx-T.x)*t,T.y+=(T.ty-T.y)*t,I.uniforms.uMouse.value=[T.x,T.y],I.uniforms.uTime.value=e*.001,p.render({scene:z})}return B=requestAnimationFrame(V),()=>{cancelAnimationFrame(B),window.removeEventListener(`resize`,L),window.removeEventListener(`mousemove`,M),document.removeEventListener(`mouseleave`,N),window.removeEventListener(`touchstart`,P),window.removeEventListener(`touchmove`,P),window.removeEventListener(`touchend`,F),window.removeEventListener(`touchcancel`,F),e.removeChild(m.canvas),m.getExtension(`WEBGL_lose_context`)?.loseContext()}},[t,i,o,c,l,u,f,y,b,x,S]),(0,m.jsx)(`div`,{ref:C,className:`h-full w-full ${e??``}`})}var b={eyeColor:`#6e0707`,pupilColor:`#fb9404`,backgroundColor:`#000000`,intensity:.2,pupilSize:.05,irisWidth:.21,glowIntensity:1,scale:.7,noiseScale:.85,pupilFollow:2,flameSpeed:.15,scrimOpacity:0},x=`evileye-config`,S=[{key:`intensity`,label:`Intensity`,min:0,max:3,step:.05},{key:`pupilSize`,label:`Pupil size`,min:0,max:1.5,step:.05},{key:`irisWidth`,label:`Iris width`,min:.05,max:1,step:.01},{key:`glowIntensity`,label:`Glow intensity`,min:0,max:1,step:.01},{key:`scale`,label:`Scale (zoom)`,min:.3,max:4,step:.05},{key:`noiseScale`,label:`Noise scale`,min:.1,max:3,step:.05},{key:`pupilFollow`,label:`Pupil follow`,min:0,max:2,step:.05},{key:`flameSpeed`,label:`Flame speed`,min:0,max:3,step:.05},{key:`scrimOpacity`,label:`Readability scrim`,min:0,max:.95,step:.01}];function C(){if(typeof window>`u`)return b;try{let e=window.localStorage.getItem(x);if(e)return{...b,...JSON.parse(e)}}catch{}return b}function w(){let[e,t]=(0,p.useState)(C),[n,r]=(0,p.useState)(!1),[i,a]=(0,p.useState)(!1);(0,p.useEffect)(()=>{try{window.localStorage.setItem(x,JSON.stringify(e))}catch{}},[e]),(0,p.useEffect)(()=>{function e(e){if(e.key.toLowerCase()!==`h`||e.metaKey||e.ctrlKey||e.altKey)return;let t=e.target;t&&(t.tagName===`INPUT`||t.tagName===`TEXTAREA`||t.isContentEditable)||r(e=>!e)}return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[]);let o=(0,p.useCallback)((e,n)=>{t(t=>({...t,[e]:n}))},[]),s=(0,p.useCallback)((e,n)=>{t(t=>({...t,[e]:n}))},[]),c=(0,p.useMemo)(()=>{let t=e;return[`<EvilEye`,`  eyeColor="${t.eyeColor}"`,`  pupilColor="${t.pupilColor}"`,`  backgroundColor="${t.backgroundColor}"`,`  intensity={${t.intensity}}`,`  pupilSize={${t.pupilSize}}`,`  irisWidth={${t.irisWidth}}`,`  glowIntensity={${t.glowIntensity}}`,`  scale={${t.scale}}`,`  noiseScale={${t.noiseScale}}`,`  pupilFollow={${t.pupilFollow}}`,`  flameSpeed={${t.flameSpeed}}`,`/>`,`// scrimOpacity: ${t.scrimOpacity}`,`// JSON: ${JSON.stringify(t)}`].join(`
`)},[e]),l=(0,p.useCallback)(async()=>{try{await navigator.clipboard.writeText(c),a(!0),setTimeout(()=>a(!1),1500)}catch{a(!1)}},[c]);return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsxs)(`div`,{"aria-hidden":`true`,style:{position:`fixed`,inset:0,zIndex:0,pointerEvents:`none`},children:[(0,m.jsx)(y,{eyeColor:e.eyeColor,pupilColor:e.pupilColor,backgroundColor:e.backgroundColor,intensity:e.intensity,pupilSize:e.pupilSize,irisWidth:e.irisWidth,glowIntensity:e.glowIntensity,scale:e.scale,noiseScale:e.noiseScale,pupilFollow:e.pupilFollow,flameSpeed:e.flameSpeed}),(0,m.jsx)(`div`,{style:{position:`absolute`,inset:0,background:`#0a0a0a`,opacity:e.scrimOpacity}})]}),n&&(0,f.createPortal)((0,m.jsx)(T,{config:e,setNum:o,setStr:s,snippet:c,copied:i,onCopy:l,onReset:()=>t(b),onClose:()=>r(!1)}),document.body)]})}function T({config:e,setNum:t,setStr:n,snippet:r,copied:i,onCopy:a,onReset:o,onClose:s}){let c={display:`flex`,justifyContent:`space-between`,fontSize:11,marginBottom:3},l={flex:1,padding:`8px 10px`,fontSize:12,fontWeight:600,color:`#e5e5e5`,background:`#1c1c1c`,border:`1px solid #3a3a3a`,borderRadius:6,cursor:`pointer`,textTransform:`none`};return(0,m.jsxs)(`div`,{style:{position:`fixed`,top:12,right:12,width:300,maxHeight:`calc(100vh - 24px)`,overflowY:`auto`,zIndex:2147483e3,padding:14,background:`rgba(12,12,12,0.94)`,border:`1px solid #333`,borderRadius:10,boxShadow:`0 12px 40px rgba(0,0,0,0.6)`,backdropFilter:`blur(6px)`,color:`#e5e5e5`,fontFamily:`ui-sans-serif, system-ui, -apple-system, sans-serif`,fontSize:12,letterSpacing:`normal`,textTransform:`none`,lineHeight:1.4},children:[(0,m.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:12},children:[(0,m.jsx)(`strong`,{style:{fontSize:13},children:`EvilEye — Tuning`}),(0,m.jsx)(`button`,{onClick:s,style:{background:`none`,border:`none`,color:`#888`,cursor:`pointer`,fontSize:18,lineHeight:1},"aria-label":`Close (H)`,children:`×`})]}),(0,m.jsx)(`div`,{style:{display:`flex`,gap:8,marginBottom:12},children:[[`eyeColor`,`Eye`],[`pupilColor`,`Pupil`],[`backgroundColor`,`Background`]].map(([t,r])=>(0,m.jsxs)(`label`,{style:{flex:1,minWidth:0},children:[(0,m.jsx)(`div`,{style:c,children:(0,m.jsx)(`span`,{children:r})}),(0,m.jsx)(`input`,{type:`color`,value:e[t],onChange:e=>n(t,e.target.value),title:e[t],style:{width:`100%`,height:28,background:`none`,border:`1px solid #3a3a3a`,borderRadius:6,cursor:`pointer`}})]},t))}),S.map(n=>(0,m.jsxs)(`div`,{style:{marginBottom:10},children:[(0,m.jsxs)(`div`,{style:c,children:[(0,m.jsx)(`span`,{children:n.label}),(0,m.jsx)(`span`,{style:{color:`#888`},children:Number(e[n.key]).toFixed(2)})]}),(0,m.jsx)(`input`,{type:`range`,min:n.min,max:n.max,step:n.step,value:e[n.key],onChange:e=>t(n.key,parseFloat(e.target.value)),style:{width:`100%`,accentColor:e.eyeColor}})]},n.key)),(0,m.jsxs)(`div`,{style:{display:`flex`,gap:8,marginTop:14},children:[(0,m.jsx)(`button`,{onClick:a,style:{...l,background:i?`#14532d`:`#1c1c1c`,borderColor:i?`#22c55e`:`#3a3a3a`},children:i?`✓ Copied!`:`Copy config`}),(0,m.jsx)(`button`,{onClick:o,style:{...l,flex:`0 0 auto`},children:`Reset`})]}),(0,m.jsx)(`pre`,{style:{marginTop:12,padding:10,background:`#0a0a0a`,border:`1px solid #262626`,borderRadius:6,fontSize:10.5,lineHeight:1.45,color:`#9ca3af`,whiteSpace:`pre-wrap`,wordBreak:`break-word`,fontFamily:`ui-monospace, SFMono-Regular, Menlo, monospace`},children:r}),(0,m.jsx)(`p`,{style:{margin:`10px 0 0`,fontSize:10.5,color:`#666`},children:`Press H to toggle this panel.`})]})}export{w as default};