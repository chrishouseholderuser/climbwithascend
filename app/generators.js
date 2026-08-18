// Ascend — procedural question generators. Loaded via <script> so the site works from file://.
// Each generator returns a fresh, self-checked question {type,stem,options:[{k,t}],correct,exp,diff,passage,gen}.
// Math is fully procedural (infinite, computed answers). R&W draws fresh combinations from curated banks.
(function(){
"use strict";
var G = {};

/* ---------- helpers ---------- */
function ri(a,b){ return a + Math.floor(Math.random()*(b-a+1)); }        // random int in [a,b]
function nz(a,b){ var v=0; while(v===0){ v=ri(a,b); } return v; }        // nonzero random int
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shuf(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }
function gcd(a,b){ a=Math.abs(a);b=Math.abs(b); while(b){ var t=b;b=a%b;a=t; } return a||1; }
function frac(n,d){ var g=gcd(n,d); n/=g; d/=g; if(d<0){n=-n;d=-d;} return d===1? String(n) : n+"/"+d; }
function fmtAdd(n){ return n<0 ? " − "+(-n) : " + "+n; }                 // " + 3" / " − 3"
function polyTerm(coef,v){ if(coef===0) return ""; var s=coef<0?" − ":" + "; var m=Math.abs(coef); return (v&&m===1)? s+v : s+m+v; }
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

// build a 4-option MC from a correct answer + candidate distractors (dedupes, pads numerically)
function build(stem, correct, distractors, exp, diff, passage){
  correct = String(correct);
  var seen = {}; seen[correct]=1; var ds=[];
  for(var i=0;i<distractors.length && ds.length<3;i++){ var d=String(distractors[i]); if(!seen[d]){ seen[d]=1; ds.push(d); } }
  // last-resort padding: nudge the number inside the answer but keep any prefix/suffix ($, π, °, "x < ")
  var m=/^(\D*?)(-?\d+(?:\.\d+)?)(\D*)$/.exec(correct), k=1;
  while(ds.length<3 && m){ var cand=m[1]+(parseFloat(m[2])+(k%2?k:-k))+m[3]; if(!seen[cand]){ seen[cand]=1; ds.push(cand); } if(++k>60) break; }
  k=1; while(ds.length<3){ var c2=correct+" ("+k+")"; if(!seen[c2]){ seen[c2]=1; ds.push(c2); } if(++k>10) break; }
  var arr=shuf([{t:correct,c:true}].concat(ds.map(function(d){return {t:d,c:false};}))).slice(0,4);
  var keys=["A","B","C","D"], ck="A";
  var options=arr.map(function(o,i){ if(o.c)ck=keys[i]; return {k:keys[i],t:o.t}; });
  return {type:"mc", stem:stem, options:options, correct:ck, exp:exp, diff:diff||3, passage:passage||"", gen:true};
}

/* =================== MATH =================== */
G["lin-eq"]=function(){
  var a=ri(2,9), x=nz(-9,9), b=ri(-9,9), c=a*x+b;
  var stem="If "+a+"x"+(b===0?"":fmtAdd(b))+" = "+c+", what is the value of x?";
  var exp=(b===0?"":"Subtract "+b+" from both sides to get "+a+"x = "+(c-b)+". ")+"Divide by "+a+": x = "+x+".";
  return build(stem, x, [x+1, x-1, -x, x+2, x-2], exp, 2);
};
G["lin-func"]=function(){
  var m=nz(-6,6), b=ri(-8,8), k=nz(-5,6), y=m*k+b;
  var stem="The function f is defined by f(x) = "+m+"x"+(b===0?"":fmtAdd(b))+". What is the value of f("+k+")?";
  var exp="Substitute x = "+k+": f("+k+") = "+m+"·("+k+")"+(b===0?"":fmtAdd(b))+" = "+y+".";
  return build(stem, y, [m*k, m*k-b, y+m, y-m], exp, 3);
};
G["systems"]=function(){
  var x=nz(-6,6), y=nz(-6,6), a1=ri(1,4), b1=nz(-4,4), a2=ri(1,4), b2=nz(-4,4);
  if(a1*b2-a2*b1===0){ b2+=(b2>=0?1:-1); }
  var c1=a1*x+b1*y, c2=a2*x+b2*y;
  var stem="If "+a1+"x"+fmtAdd(b1)+"y = "+c1+" and "+a2+"x"+fmtAdd(b2)+"y = "+c2+", what is the value of x?";
  var exp="Solving the system gives x = "+x+" and y = "+y+".";
  return build(stem, x, [y, x+1, x-1, x+2], exp, 4);
};
G["inequalities"]=function(){
  var a=ri(2,6), b=ri(-8,8), k=nz(-5,6), c=a*k+b, op=pick(["≤","<","≥",">"]), flip={"≤":"≥","<":">","≥":"≤",">":"<"};
  var stem="What is the solution to "+a+"x"+(b===0?"":fmtAdd(b))+" "+op+" "+c+"?";
  var exp=(b===0?"":"Subtract "+b+": "+a+"x "+op+" "+(c-b)+". ")+"Divide by "+a+" (positive, so the sign stays): x "+op+" "+k+".";
  return build(stem, "x "+op+" "+k, ["x "+flip[op]+" "+k, "x "+op+" "+(k+1), "x "+op+" "+(k-1)], exp, 3);
};
G["quadratics"]=function(){
  var r1=nz(-6,6), r2=nz(-6,6), p=-(r1+r2), q=r1*r2;
  var stem="What are the solutions to x²"+polyTerm(p,"x")+polyTerm(q,"")+" = 0?";
  var exp="Factor: (x"+fmtAdd(-r1)+")(x"+fmtAdd(-r2)+") = 0, so x = "+r1+" or x = "+r2+".";
  return build(stem, "x = "+r1+", x = "+r2, ["x = "+(-r1)+", x = "+(-r2), "x = "+r1+", x = "+(-r2), "x = "+(r1+1)+", x = "+r2], exp, 4);
};
G["equiv-expr"]=function(){
  var a=nz(-6,6), b=nz(-6,6), s=a+b, p=a*b;
  var stem="Which of the following is equivalent to (x"+fmtAdd(a)+")(x"+fmtAdd(b)+")?";
  var correct="x²"+polyTerm(s,"x")+polyTerm(p,"");
  var exp="Use FOIL: x²"+polyTerm(s,"x")+polyTerm(p,"")+".";
  return build(stem, correct, ["x²"+polyTerm(s,"x")+polyTerm(-p,""), "x²"+polyTerm(p,"x")+polyTerm(s,""), "x²"+polyTerm(s+1,"x")+polyTerm(p,"")], exp, 3);
};
G["nonlinear-func"]=function(){
  var a=ri(2,5), b=pick([2,3,10]), k=ri(1,3), y=a*Math.pow(b,k);
  var stem="The function f is defined by f(x) = "+a+"·"+b+"^x. What is the value of f("+k+")?";
  var exp="f("+k+") = "+a+"·"+b+"^"+k+" = "+a+"·"+Math.pow(b,k)+" = "+y+".";
  return build(stem, y, [Math.pow(b,k), a*b*k, a*Math.pow(b,k-1)], exp, 3);
};
G["percentages"]=function(){
  var p=pick([5,10,15,20,25,30,40,50,60,75]), base=pick([20,40,60,80,120,160,200,240,300,400]), v=p*base/100, step=base/20;
  var stem="What is "+p+"% of "+base+"?";
  var exp=p+"% of "+base+" = "+(p/100)+" × "+base+" = "+v+".";
  return build(stem, v, [v+step, v-step, Math.round(base*(p+10)/100)], exp, 2);
};
G["ratios"]=function(){
  var per=pick([2,3,4,5]), unit=pick([2,3,4,5,6]), price=per*unit, want=per*ri(2,6), ans=unit*want;
  var stem="If "+per+" notebooks cost $"+price+", how much do "+want+" notebooks cost at the same rate?";
  var exp="Unit price = $"+price+" ÷ "+per+" = $"+unit+". Then "+want+" × $"+unit+" = $"+ans+".";
  return build(stem, "$"+ans, ["$"+(ans+unit), "$"+(ans-unit), "$"+((unit+1)*want)], exp, 3);
};
G["one-var-data"]=function(){
  var mean=ri(6,20), nums=[], sum=mean*5, s=0, ok=true;
  for(var i=0;i<4;i++){ var v=ri(Math.max(1,mean-6),mean+6); nums.push(v); s+=v; }
  var last=sum-s; if(last<1||last>mean+12){ nums=[mean,mean-2,mean+2,mean-1,mean+1]; } else nums.push(last);
  var stem="What is the mean (average) of these numbers? "+shuf(nums).join(", ");
  var exp="Add them to get "+sum+", then divide by 5: "+mean+".";
  return build(stem, mean, [mean+1, mean-1, mean+2], exp, 3);
};
G["probability"]=function(){
  var r=ri(2,8), b=ri(2,8); while(b===r){ b=ri(2,8); } var tot=r+b;
  var stem="A bag contains "+r+" red and "+b+" blue marbles. If one marble is drawn at random, what is the probability that it is red?";
  var exp="P(red) = favorable ÷ total = "+r+"/"+tot+" = "+frac(r,tot)+".";
  return build(stem, frac(r,tot), [frac(b,tot), frac(r,tot+1), frac(r+1,tot), frac(tot-1,tot)], exp, 3);
};
G["triangles"]=function(){
  var a=ri(30,80), b=ri(30,80); while(a+b>=170||a+b<=20){ b=ri(20,70); } var c=180-a-b;
  var stem="Two angles of a triangle measure "+a+"° and "+b+"°. What is the measure of the third angle?";
  var exp="The angles sum to 180°: 180 − "+a+" − "+b+" = "+c+"°.";
  return build(stem, c+"°", [(c+10)+"°", (c-10)+"°", (a+b)+"°"], exp, 2);
};
var TRIPLES=[[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[7,24,25],[20,21,29],[10,24,26]];
G["right-tri-trig"]=function(){
  var t=pick(TRIPLES);
  var stem="A right triangle has legs of length "+t[0]+" and "+t[1]+". What is the length of the hypotenuse?";
  var exp="By the Pythagorean theorem, c = √("+t[0]+"² + "+t[1]+"²) = √"+(t[0]*t[0]+t[1]*t[1])+" = "+t[2]+".";
  return build(stem, t[2], [t[0]+t[1], t[2]+1, t[2]-2], exp, 3);
};
G["circles"]=function(){
  var r=ri(2,12);
  if(pick([0,1])===0){ var a=r*r; return build("A circle has a radius of "+r+". What is its area? (Use A = πr².)", a+"π", [(2*r)+"π", r+"π", (a+r)+"π"], "A = π·"+r+"² = "+a+"π.", 3); }
  var c=2*r; return build("A circle has a radius of "+r+". What is its circumference? (Use C = 2πr.)", c+"π", [(r*r)+"π", r+"π", (c+2)+"π"], "C = 2π·"+r+" = "+c+"π.", 3);
};
G["area-volume"]=function(){
  var t=pick(["rect","box","cyl"]);
  if(t==="rect"){ var l=ri(3,15), w=ri(2,12); return build("A rectangle has a length of "+l+" and a width of "+w+". What is its area?", l*w, [2*(l+w), l+w, l*w+l], "Area = length × width = "+l+" × "+w+" = "+(l*w)+".", 2); }
  if(t==="box"){ var x=ri(2,8), y=ri(2,8), z=ri(2,8); return build("A rectangular box measures "+x+" by "+y+" by "+z+". What is its volume?", x*y*z, [x+y+z, x*y, 2*(x*y+y*z+x*z)], "Volume = "+x+" × "+y+" × "+z+" = "+(x*y*z)+".", 3); }
  var rr=ri(2,7), h=ri(2,9); return build("A cylinder has a radius of "+rr+" and a height of "+h+". What is its volume? (Use V = πr²h.)", (rr*rr*h)+"π", [(2*rr*h)+"π", (rr*h)+"π", (rr*rr+h)+"π"], "V = π·"+rr+"²·"+h+" = "+(rr*rr*h)+"π.", 3);
};

/* =================== READING & WRITING =================== */
var TR={ contrast:["However","In contrast","Nevertheless","On the other hand","Even so","Still","Conversely"], cause:["Therefore","As a result","Consequently","Thus","Hence","For this reason"],
  addition:["In addition","Moreover","Furthermore","Also","Likewise","What is more"], example:["For example","For instance","Specifically","In particular","To illustrate"],
  sequence:["First","Next","Then","Finally","Subsequently","Afterward"] };
var TRDESC={ contrast:"contradicts or qualifies the first", cause:"is a result of the first", addition:"adds another point to the first",
  example:"gives an example of the first", sequence:"comes after the first in a sequence" };
var TR_PAIRS=[
 {a:"The new policy was intended to reduce downtown traffic.", b:"in its first year it actually made congestion worse.", rel:"contrast"},
 {a:"The bridge had gone without maintenance for decades.", b:"engineers finally judged it unsafe for heavy trucks.", rel:"cause"},
 {a:"Solar panels have become far cheaper to manufacture.", b:"battery storage now lasts much longer than it once did.", rel:"addition"},
 {a:"Many desert animals avoid the midday heat.", b:"the fennec fox hunts almost entirely at night.", rel:"example"},
 {a:"The committee reviewed hundreds of applications.", b:"it narrowed the pool to twelve finalists.", rel:"sequence"},
 {a:"Critics expected the low-budget film to flop.", b:"it became the year's surprise hit.", rel:"contrast"},
 {a:"The region received almost no rain for three months.", b:"the reservoir dropped to its lowest level in years.", rel:"cause"},
 {a:"The museum expanded its evening hours.", b:"it added a free admission night each week.", rel:"addition"},
 {a:"Some plants defend themselves with chemicals.", b:"the milkweed fills its leaves with a bitter toxin.", rel:"example"},
 {a:"The researchers gathered their samples.", b:"they analyzed each one under a microscope.", rel:"sequence"},
 {a:"The author's early novels were praised for their realism.", b:"her later work embraced pure fantasy.", rel:"contrast"},
 {a:"Remote work cut the company's office costs.", b:"employees reported shorter, less stressful commutes.", rel:"addition"},
 {a:"The vaccine had passed every laboratory test.", b:"regulators still required a full year of human trials.", rel:"contrast"},
 {a:"Overfishing had emptied the bay for a generation.", b:"a strict ban let the fish populations slowly return.", rel:"cause"},
 {a:"The recipe calls for a handful of fresh herbs.", b:"basil and thyme both work especially well.", rel:"example"},
 {a:"The archaeologists first mapped the entire site.", b:"they began carefully excavating one square at a time.", rel:"sequence"},
 {a:"The startup's app was praised by every reviewer.", b:"almost no one actually downloaded it.", rel:"contrast"},
 {a:"A hard frost struck the orchard in early May.", b:"the season's apple harvest was cut nearly in half.", rel:"cause"},
 {a:"The city widened the bike lanes downtown.", b:"it lowered the speed limit on the busiest streets.", rel:"addition"},
 {a:"Some birds migrate thousands of miles each year.", b:"the Arctic tern flies from pole to pole and back.", rel:"example"},
 {a:"The students brainstormed dozens of rough ideas.", b:"they voted to develop the three strongest ones.", rel:"sequence"},
 {a:"The novel was a runaway bestseller for months.", b:"most critics dismissed it as shallow and forgettable.", rel:"contrast"},
 {a:"The factory switched entirely to solar power.", b:"its monthly energy bills fell by nearly half.", rel:"cause"},
 {a:"Many everyday materials are quietly recyclable.", b:"aluminum can be melted and reused almost endlessly.", rel:"example"}
];
G["transitions"]=function(){
  var p=pick(TR_PAIRS), correct=pick(TR[p.rel]), others=[];
  for(var k in TR){ if(k!==p.rel) others=others.concat(TR[k]); }
  var ds=shuf(others).slice(0,3);
  var passage=cap(p.a)+" ______, "+p.b;
  var exp="The second statement "+TRDESC[p.rel]+", so a "+p.rel+" transition such as “"+correct+"” fits best.";
  return build("Which choice completes the text with the most logical transition?", correct, ds, exp, 3, passage);
};

var INTRO=[
 ["because the storm intensified overnight","the organizers canceled the outdoor concert"],
 ["although the recipe looked complicated","it required only a few common ingredients"],
 ["after the volunteers cleared the trail","hikers returned to the park in large numbers"],
 ["when the funding finally arrived","construction on the library resumed"],
 ["since the software update was released","users have reported far fewer crashes"],
 ["while the orchestra tuned their instruments","the audience settled into their seats"],
 ["if the experiment succeeds","the team will publish its results next spring"],
 ["once the river flooded the valley","farmers moved their livestock to higher ground"],
 ["because the museum extended its hours","attendance rose sharply over the summer"],
 ["although the team trailed at halftime","it rallied to win the championship"],
 ["before the sun had fully risen","the fishing boats were already far out to sea"],
 ["since the new bridge opened","the old ferry has carried far fewer passengers"],
 ["whenever the power goes out","the backup generator starts within seconds"],
 ["as the negotiations dragged on","both sides grew increasingly impatient"],
 ["because the trail was poorly marked","several hikers lost their way near the ridge"],
 ["although the critics were unimpressed","audiences packed the theater for months"],
 ["once the vaccine was approved","clinics across the country began scheduling patients"],
 ["while the committee debated the budget","the deadline quietly slipped past"],
 ["after the volcano finally fell silent","botanists returned to study the new growth"],
 ["unless the city repairs the levee","the low-lying blocks will flood again each spring"]
];
G["boundaries"]=function(){
  var c=pick(INTRO), correct=cap(c[0])+", "+c[1]+".";
  var exp="An introductory dependent clause (one beginning with a word like “because,” “although,” or “when”) is set off from the main clause with a comma.";
  return build("Which choice completes the text so that it conforms to the conventions of Standard English?", correct,
    [cap(c[0])+" "+c[1]+".", cap(c[0])+"; "+c[1]+".", cap(c[0])+" — "+c[1]+"."], exp, 3);
};

var SVA=[
 {head:"The box of old photographs", num:"s", tail:"in the attic"},
 {head:"The players on the winning team", num:"p", tail:"from the coach"},
 {head:"The list of required materials", num:"s", tail:"on the syllabus"},
 {head:"The results of the survey", num:"p", tail:"surprising to the researchers"},
 {head:"Each of the students", num:"s", tail:"a laptop"},
 {head:"The flock of geese", num:"s", tail:"over the lake every autumn"},
 {head:"The cabinets in the new kitchen", num:"p", tail:"a soft grey"},
 {head:"The bouquet of roses", num:"s", tail:"on the table"},
 {head:"The engineers on the project", num:"p", tail:"reviewing the final design"},
 {head:"The collection of rare coins", num:"s", tail:"worth a small fortune"},
 {head:"The stack of unread reports", num:"s", tail:"growing taller by the day"},
 {head:"The dancers in the front row", num:"p", tail:"perfectly in step"},
 {head:"The bowl of ripe strawberries", num:"s", tail:"gone by noon"},
 {head:"The delegates from each country", num:"p", tail:"seated in alphabetical order"},
 {head:"The bundle of old letters", num:"s", tail:"tied with a faded ribbon"},
 {head:"The trees along the riverbank", num:"p", tail:"heavy with spring blossoms"},
 {head:"The set of kitchen knives", num:"s", tail:"kept razor sharp"},
 {head:"The runners at the starting line", num:"p", tail:"tense and ready"},
 {head:"The plate of warm cookies", num:"s", tail:"meant for the guests"},
 {head:"The paintings in the east gallery", num:"p", tail:"on loan from a private owner"}
];
G["grammar-usage"]=function(){
  var e=pick(SVA), sing=e.num==="s", correct=sing?"is":"are";
  var passage=e.head+" ______ "+e.tail+".";
  var head=e.head.replace(/^The |^Each of the /,"");
  var exp="The subject is “"+e.head+",” which is "+(sing?"singular":"plural")+" — ignore the phrase between the subject and the verb — so it takes “"+correct+".”";
  return build("Which choice completes the text so that it conforms to the conventions of Standard English?", correct,
    sing?["are","were","have been"]:["is","was","has been"], exp, 3, passage);
};

// distractors are plausible IN THIS SENTENCE (they'd fit the slot) but mean something different — so keyword-matching won't work
var VOCAB=[
 {w:"candid", ctx:"In her candid review, the critic pointed out both the film's strengths and its flaws.", correct:"frank and honest", d:["harshly negative","richly detailed","openly admiring"]},
 {w:"meticulous", ctx:"A meticulous researcher, she checked every single measurement three separate times.", correct:"extremely careful about detail", d:["endlessly patient","notably strict","visibly weary"]},
 {w:"novel", ctx:"The engineers proposed a novel solution that no one had tried before.", correct:"new and original", d:["surprisingly clever","needlessly risky","far too complicated"]},
 {w:"prudent", ctx:"Setting aside part of each paycheck was a prudent decision that paid off years later.", correct:"wise and cautious", d:["unusually generous","strikingly bold","remarkably lucky"]},
 {w:"abundant", ctx:"Rain was abundant that spring, and the fields turned a deep green.", correct:"present in great quantity", d:["gentle and steady","warmly welcome","unusually early"]},
 {w:"tedious", ctx:"Copying the long list of figures by hand was tedious, but it had to be done.", correct:"tiresome and dull", d:["genuinely difficult","surprisingly delicate","increasingly urgent"]},
 {w:"volatile", ctx:"The chemical is volatile and must be stored in a sealed, cool container.", correct:"unstable and quick to change", d:["extremely valuable","highly poisonous","fairly common"]},
 {w:"resilient", ctx:"The resilient community rebuilt within a year of the devastating flood.", correct:"quick to recover", d:["notably wealthy","unusually close-knit","fiercely determined"]},
 {w:"ambiguous", ctx:"The instructions were ambiguous, so half the class did the assignment differently.", correct:"open to more than one meaning", d:["overly lengthy","poorly written","highly technical"]},
 {w:"diligent", ctx:"A diligent student, he reviewed his notes every single night without fail.", correct:"steadily hard-working", d:["quietly anxious","naturally gifted","endlessly curious"]},
 {w:"scarce", ctx:"Fresh water grew scarce as the drought stretched into its fourth month.", correct:"in short supply", d:["increasingly dirty","highly precious","strangely still"]},
 {w:"innovative", ctx:"The startup's innovative app completely changed how people booked appointments.", correct:"inventive and original", d:["instantly popular","surprisingly affordable","impressively reliable"]},
 {w:"reluctant", ctx:"She was reluctant to speak first, so she waited for someone else to begin.", correct:"unwilling and hesitant", d:["clearly unprepared","overly polite","visibly nervous"]},
 {w:"vivid", ctx:"His vivid description of the storm made the readers feel as if they were there.", correct:"strikingly lifelike and clear", d:["unusually lengthy","completely honest","surprisingly gentle"]},
 {w:"trivial", ctx:"They argued for an hour over a trivial detail that changed nothing about the plan.", correct:"minor and unimportant", d:["deeply confusing","highly technical","oddly familiar"]},
 {w:"deteriorate", ctx:"Without any repairs, the old wooden pier began to deteriorate year after year.", correct:"steadily decline and decay", d:["slowly shrink","gradually sink","noticeably sway"]},
 {w:"skeptical", ctx:"Investors were skeptical of the company's bold promises and demanded proof.", correct:"doubtful and unconvinced", d:["genuinely curious","openly impatient","quietly hopeful"]},
 {w:"concise", ctx:"Her concise summary covered the entire report in just three clear sentences.", correct:"brief and to the point", d:["highly polished","frustratingly vague","strictly formal"]},
 {w:"inevitable", ctx:"With the storm bearing down on the coast, the flight's delay was inevitable.", correct:"impossible to avoid", d:["entirely unexpected","only temporary","deeply unfortunate"]},
 {w:"lucrative", ctx:"The new contract quickly proved lucrative for the small design firm.", correct:"highly profitable", d:["extremely demanding","widely prestigious","strictly temporary"]},
 {w:"deliberate", ctx:"She made a deliberate choice to wait a day before responding to the offer.", correct:"careful and intentional", d:["sudden and rushed","difficult and painful","hesitant and unsure"]},
 {w:"fluctuate", ctx:"Gasoline prices tend to fluctuate sharply with the changing seasons.", correct:"rise and fall irregularly", d:["climb steadily upward","suddenly collapse","level off completely"]},
 {w:"obsolete", ctx:"The once-popular software was obsolete within just a few years of its release.", correct:"out of date and no longer used", d:["far too expensive","surprisingly unpopular","frustratingly unreliable"]},
 {w:"tentative", ctx:"The committee drew up a tentative schedule that was still open to change.", correct:"not yet final; provisional", d:["highly detailed","strictly confidential","overly ambitious"]},
 {w:"arduous", ctx:"The arduous climb to the summit took the hikers two full days.", correct:"extremely difficult and tiring", d:["remarkably scenic","unusually lengthy","genuinely dangerous"]},
 {w:"gregarious", ctx:"A gregarious host, he was happiest in a room full of chattering guests.", correct:"sociable and outgoing", d:["endlessly generous","reliably cheerful","quietly observant"]},
 {w:"lucid", ctx:"Her lucid explanation of the theory was clear enough for a beginner to follow.", correct:"clear and easy to understand", d:["admirably brief","remarkably patient","impressively detailed"]},
 {w:"futile", ctx:"After the vote was final, further argument seemed completely futile.", correct:"pointless and doomed to fail", d:["needlessly rude","utterly exhausting","potentially risky"]},
 {w:"austere", ctx:"The monk's austere room held nothing but a bed, a chair, and a single lamp.", correct:"plain and bare", d:["strangely cramped","perfectly quiet","spotlessly clean"]},
 {w:"spontaneous", ctx:"On a spontaneous whim, they packed a bag and left for the coast that afternoon.", correct:"sudden and unplanned", d:["surprisingly bold","rather expensive","carefully shared"]},
 {w:"profound", ctx:"The discovery had a profound effect on the entire field of medicine.", correct:"deep and far-reaching", d:["quite sudden","clearly positive","long-lasting"]},
 {w:"redundant", ctx:"An editor trimmed the report, which was padded with redundant phrases.", correct:"repetitive and unnecessary", d:["overly technical","far too lengthy","genuinely confusing"]},
 {w:"pragmatic", ctx:"Rather than chase the perfect answer, she took a pragmatic approach that simply worked.", correct:"practical and realistic", d:["notably cautious","coldly unfeeling","refreshingly cheerful"]},
 {w:"elusive", ctx:"The cause of the glitch proved elusive, slipping past the team for weeks.", correct:"hard to find or pin down", d:["deeply harmful","widely known","purely imaginary"]}
];
G["words-in-context"]=function(){
  var v=pick(VOCAB);
  var exp="In this sentence, “"+v.w+"” most nearly means “"+v.correct+".”";
  return build("As used in the text, “"+v.w+"” most nearly means", v.correct, v.d, exp, 3, v.ctx);
};

// short passages with structured facts -> correct-by-construction comprehension questions
// Each passage carries its OWN on-topic-but-wrong options so distractors are plausible, not off-topic:
//  cd  = wrong "main ideas" (too narrow / too broad / distorted)   infW = wrong "inferences" (overreach / contradiction)
//  ceW = on-topic statements that do NOT support the main idea      (detail is reused as a "too-narrow / stated-not-inferred" trap)
var PASS=[
 {text:"Community gardens have turned many vacant city lots into productive green spaces. Residents grow fresh vegetables, neighbors get to know one another while tending shared plots, and the planted land even helps cool the surrounding blocks on hot days.",
  main:"Community gardens turn unused city lots into spaces that benefit residents in several ways.",
  detail:"Neighbors get to know one another while tending shared plots.",
  infer:"With coordinated effort, vacant lots can be made useful rather than left empty.",
  structure:"It introduces a change and then lists several of its benefits.",
  cd:["Community gardens exist mainly to lower the temperature of city neighborhoods.","Most cities are quickly running out of vacant lots to turn into gardens."],
  infW:["Community gardens can grow enough food to feed an entire city.","A vacant lot is worth more to a neighborhood when it is left empty."],
  ceW:["Vacant lots can sit unused for many years before anything is built.","Some gardeners prefer to grow flowers rather than vegetables.","Community gardens can be found in cities around the world."]},
 {text:"For centuries, sailors navigated by the stars. A skilled navigator could fix a ship's position using only the night sky and a few simple instruments. When clouds hid the stars, however, even experienced crews could drift far off course.",
  main:"Before modern tools, sailors relied on the stars to navigate—a method that worked well but had clear limits.",
  detail:"When clouds hid the stars, even experienced crews could drift far off course.",
  infer:"Cloud cover could make star-based navigation unreliable.",
  structure:"It describes a method and then notes a limitation of it.",
  cd:["Sailors of the past were never able to tell where their ship was.","The hardest part of sailing was building the simple instruments navigators used."],
  infW:["Sailors refused to leave port whenever the sky was cloudy.","Cloudy weather had no real effect on how sailors navigated."],
  ceW:["Navigators could fix a position using only the sky and a few instruments.","Sailors navigated by the stars for many centuries.","The stars appear to shift across the sky through the night."]},
 {text:"The axolotl, a salamander native to a few lakes in Mexico, can regrow lost limbs, parts of its heart, and even sections of its brain. Scientists study it closely, hoping its remarkable healing may one day guide new medical treatments for humans.",
  main:"The axolotl's rare ability to regenerate body parts makes it valuable to medical researchers.",
  detail:"The axolotl can regrow lost limbs, parts of its heart, and sections of its brain.",
  infer:"Studying the axolotl could contribute to future advances in human medicine.",
  structure:"It presents an unusual trait and explains why it matters.",
  cd:["The axolotl is studied mainly because it is so rare in the wild.","The axolotl is the only kind of salamander that lives in Mexico."],
  infW:["Doctors already use the axolotl's cells to heal human injuries.","Scientists have found little reason to be interested in the axolotl."],
  ceW:["The axolotl is a salamander native to a few lakes in Mexico.","Many salamanders are able to regrow a lost tail.","Scientists have studied salamanders for a very long time."]},
 {text:"When a public library added a free evening tutoring program, something unexpected happened. Not only did students' grades improve, but parents who dropped them off began browsing the shelves, and adult library use climbed to its highest level in a decade.",
  main:"A library's tutoring program produced benefits that reached well beyond the students it was designed for.",
  detail:"Adult library use climbed to its highest level in a decade.",
  infer:"A program aimed at one group can end up benefiting others as well.",
  structure:"It describes an action and then traces its wider effects.",
  cd:["The tutoring program was created mainly to raise adult library attendance.","Free tutoring is the best possible way to improve students' grades."],
  infW:["Every library that starts a tutoring program will see the same results.","The tutoring program did nothing for the students it was meant to serve."],
  ceW:["Students attended the tutoring sessions in the evenings.","The tutoring program was offered free of charge.","Libraries provide many services besides tutoring."]},
 {text:"Honeybees communicate the location of food through a 'waggle dance.' By changing the angle and duration of the dance, a returning bee tells the others both the direction of a flower patch and how far away it lies. The rest of the hive then flies straight to it.",
  main:"Honeybees use a precise dance to tell one another exactly where to find food.",
  detail:"The angle and duration of the dance signal both the direction and the distance of the food.",
  infer:"Bees can share detailed information without any spoken language.",
  structure:"It states a behavior and then explains how it works.",
  cd:["Honeybees are unable to communicate with one another.","The waggle dance is mainly a way for bees to attract mates."],
  infW:["Honeybees are more intelligent than every other kind of insect.","Bees locate food entirely by chance rather than by sharing information."],
  ceW:["The hive leaves to gather nectar during the day.","A returning bee performs its dance inside the hive.","Bees are known to visit many different kinds of flowers."]},
 {text:"The invention of refrigerated railcars changed what Americans ate. Suddenly, fruit grown in California could reach markets on the East Coast still fresh. Regional diets, once limited to what grew nearby, slowly began to look much more alike from coast to coast.",
  main:"Refrigerated railcars widened Americans' diets by letting fresh food travel long distances.",
  detail:"Fruit grown in California could reach East Coast markets still fresh.",
  infer:"Improvements in transportation can reshape everyday habits such as eating.",
  structure:"It links an invention to the broad changes it brought about.",
  cd:["Refrigerated railcars were the most expensive invention of their time.","Before railcars existed, Americans refused to eat any fruit at all."],
  infW:["Today every food is available fresh in every place at all times.","Regional diets stayed exactly the same after railcars appeared."],
  ceW:["Railcars ran on tracks that stretched across the country.","People on the East Coast already enjoyed plenty of local produce.","Refrigeration is a way of keeping food cold."]},
 {text:"Coral reefs cover less than one percent of the ocean floor, yet they shelter roughly a quarter of all marine species. When rising temperatures cause corals to bleach and die, the countless animals that depend on the reef lose their home along with it.",
  main:"Though tiny in area, coral reefs support a huge share of ocean life, which makes their decline especially serious.",
  detail:"Coral reefs shelter roughly a quarter of all marine species.",
  infer:"Damage to reefs threatens far more species than the corals themselves.",
  structure:"It contrasts the reefs' small size with their outsized importance.",
  cd:["Coral reefs make up the majority of the ocean floor.","The main problem facing coral reefs is that they cover too little area."],
  infW:["If reefs vanished, no other ocean species would be affected.","Rising ocean temperatures are good for most coral reefs."],
  ceW:["Coral reefs cover less than one percent of the ocean floor.","Warmer water can cause corals to lose their color.","Many reef fish are brightly colored."]},
 {text:"Early bicycles, with their enormous front wheels, were fast but dangerous and hard to mount. The arrival of the 'safety bicycle,' with two equal wheels and a chain drive, made cycling something almost anyone could do — and its popularity exploded.",
  main:"A safer design turned the bicycle from a risky novelty into a machine almost anyone could use.",
  detail:"The safety bicycle had two equal wheels and a chain drive.",
  infer:"Making a technology easier to use can dramatically widen who adopts it.",
  structure:"It contrasts an earlier design with an improved one.",
  cd:["Early bicycles were better than the safety bicycle because they were faster.","Bicycles became popular mainly because they were inexpensive to buy."],
  infW:["No one rode any kind of bicycle before the safety bicycle appeared.","The safety bicycle was actually more dangerous than the earlier design."],
  ceW:["Early bicycles had one enormous front wheel.","Cycling can be a fast way to get around.","The safety bicycle's popularity grew very quickly."]},
 {text:"The Sahara was not always a desert. Cave paintings deep in its now-barren hills show people herding cattle beside rivers and lakes. Thousands of years ago, a shift in the region's climate slowly dried the landscape into the sea of sand we know today.",
  main:"Evidence indicates the Sahara was once green, until a change in climate turned it into desert.",
  detail:"Cave paintings show people herding cattle beside rivers and lakes.",
  infer:"A region's climate can change dramatically over long spans of time.",
  structure:"It challenges a present assumption using evidence from the past.",
  cd:["The Sahara has always been the barren desert it is today.","Cave paintings are the most important artwork of the ancient world."],
  infW:["The Sahara will turn green again within just a few years.","The climate of a region never changes over time."],
  ceW:["Today the Sahara is a vast sea of sand.","Ancient peoples often painted on the walls of caves.","Deserts by definition receive very little rain."]},
 {text:"Volunteering to plant trees might seem like a small act. Yet a single mature tree can filter pollutants from the air, provide shade that lowers cooling costs, and offer a home to dozens of species. Multiplied across a city, those small acts add up to real change.",
  main:"Planting trees, though it seems minor, produces meaningful benefits, especially when many people take part.",
  detail:"A single mature tree can filter pollutants, provide cooling shade, and house dozens of species.",
  infer:"Small individual efforts can combine into a large collective impact.",
  structure:"It moves from a single small action to its larger cumulative effect.",
  cd:["Planting one tree has no real effect on a city at all.","Trees are valuable mainly because they provide people with shade."],
  infW:["A city could solve all of its problems simply by planting trees.","Individual actions almost never make any difference."],
  ceW:["Many people assume that planting a tree is only a small act.","A large city contains many thousands of trees.","Trees generally grow slowly over many years."]},
 {text:"An octopus can change the color and texture of its skin in under a second. Cells packed with pigment let it blend into sand, coral, or rock, and it can even raise bumps to mimic a rough surface. This near-instant disguise hides the animal from the predators that hunt it and the prey it hopes to ambush.",
  main:"An octopus's fast, detailed camouflage helps it both avoid predators and ambush prey.",
  detail:"It can raise bumps on its skin to mimic a rough surface.",
  infer:"A single ability can serve an animal in more than one way.",
  structure:"It describes an ability and then explains what that ability accomplishes.",
  cd:["An octopus changes color chiefly to signal to other octopuses.","An octopus is permanently invisible to everything else in the sea."],
  infW:["An octopus relies on camouflage as its only means of defense.","An octopus can disguise itself just as easily on land as underwater."],
  ceW:["An octopus has eight arms lined with suckers.","Octopuses are found in oceans all over the world.","An octopus has a soft body with no bones."]},
 {text:"Modern concrete often cracks and crumbles within decades, yet Roman harbor walls have stood in seawater for two thousand years. Researchers found that the Romans mixed volcanic ash into their concrete; over time, seawater reacted with the ash to grow new minerals that sealed cracks, leaving the walls stronger rather than weaker.",
  main:"Roman concrete has lasted for millennia because an unusual ingredient let it heal its own cracks over time.",
  detail:"Seawater reacted with the volcanic ash to grow new minerals that sealed cracks.",
  infer:"Studying old techniques can reveal ideas that improve modern materials.",
  structure:"It contrasts a modern problem with an ancient solution and explains why the solution worked.",
  cd:["Roman concrete survived mainly because the walls were built extremely thick.","The Romans discovered concrete long before any other civilization did."],
  infW:["Modern engineers can no longer build anything that lasts.","Adding volcanic ash makes any material indestructible."],
  ceW:["Roman harbor walls sit in salt water.","The Romans built many harbors around the Mediterranean.","Concrete is made by mixing several materials together."]},
 {text:"Giant tortoises can live well past a hundred years, far longer than most mammals their size. Part of the reason is their slow metabolism: as cold-blooded animals, they burn energy at a fraction of a mammal's rate. Cells that work slowly also tend to wear out slowly, which may help stretch the tortoise's long life.",
  main:"The giant tortoise's very slow metabolism is a key reason it can live for more than a century.",
  detail:"As cold-blooded animals, tortoises burn energy at a fraction of a mammal's rate.",
  infer:"How quickly an animal uses energy may be linked to how long it lives.",
  structure:"It states a fact and then explains the likely reason behind it.",
  cd:["Giant tortoises live so long mainly because they grow so large.","Cold-blooded animals always outlive warm-blooded ones."],
  infW:["A slow metabolism guarantees that any animal will live for a century.","Giant tortoises never die of old age."],
  ceW:["Giant tortoises can weigh several hundred pounds.","A tortoise carries a hard protective shell.","Tortoises move slowly across the ground."]},
 {text:"Covering a bare rooftop with soil and plants does more than look pleasant. The greenery absorbs sunlight that dark tar would otherwise soak up as heat, cooling the building below and the air around it. Rooftop gardens also drink up rainwater that would otherwise rush into overloaded storm drains.",
  main:"Rooftop gardens offer practical benefits, cooling buildings and easing the strain on storm drains.",
  detail:"Rooftop gardens drink up rainwater that would otherwise rush into overloaded storm drains.",
  infer:"A change made for appearance can end up solving practical problems too.",
  structure:"It corrects a narrow assumption and then lists practical benefits.",
  cd:["Rooftop gardens are worthwhile mainly because they look pleasant.","Any building would stay cool if its roof were simply painted white."],
  infW:["Rooftop gardens could eliminate a city's flooding entirely.","Plants on a roof do nothing for the building beneath them."],
  ceW:["Many buildings have flat, unused rooftops.","A rooftop garden needs regular watering and weeding.","Tar is a common roofing material."]},
 {text:"A hunting bat sends out streams of high-pitched clicks and listens for the echoes that bounce back. From the tiny delay between a click and its echo, the bat can judge how far away an insect is, and shifts in the echo reveal the insect's size and direction. In total darkness, a bat can snatch a moth from midair.",
  main:"By reading the echoes of its own clicks, a bat can locate and catch prey in complete darkness.",
  detail:"From the delay between a click and its echo, the bat judges how far away an insect is.",
  infer:"An animal can build a detailed picture of its surroundings without using sight.",
  structure:"It describes a process and ends with what that process makes possible.",
  cd:["A bat's clicks are meant mainly to warn other bats away.","Bats are the only animals capable of hunting at night."],
  infW:["A bat has no use for its eyes at all.","Echolocation works only on unusually large insects."],
  ceW:["Bats are active mostly after dark.","A bat's clicks are too high-pitched for people to hear.","Many insects take flight in the evening."]},
 {text:"Sourdough bread rises without any packaged yeast. Instead, a baker keeps a 'starter,' a living mix of flour and water teeming with wild yeast and bacteria drawn from the air. As these microbes feed on the flour, they give off gases that lift the dough and acids that give the loaf its tangy flavor.",
  main:"Sourdough rises and gains its flavor from a living culture of wild microbes rather than packaged yeast.",
  detail:"As the microbes feed on the flour, they give off gases that lift the dough.",
  infer:"Everyday foods can depend on living organisms working unseen.",
  structure:"It states an unusual fact and then explains the process behind it.",
  cd:["Sourdough is hard to make mainly because good flour is difficult to find.","Sourdough is the oldest food that humans have ever eaten."],
  infW:["Sourdough can be baked from scratch in just a few minutes.","Wild yeast makes bread rise faster than any other method."],
  ceW:["A sourdough starter is a mix of flour and water.","Bread has been baked for thousands of years.","Many other breads are made with packaged yeast."]},
 {text:"Each fall, monarch butterflies escape the cold by flying up to three thousand miles to a few forests in central Mexico. What astonishes scientists is that no single butterfly makes the round trip; the monarchs that return north in spring are the great-grandchildren of those that left. Somehow the route is passed down without ever being taught.",
  main:"Monarchs complete an enormous migration that no individual finishes, yet the route is somehow inherited across generations.",
  detail:"The monarchs that return north in spring are the great-grandchildren of those that left.",
  infer:"Some complex behaviors can be inherited rather than learned.",
  structure:"It presents a fact and then highlights a puzzling detail about it.",
  cd:["Monarch butterflies migrate mainly to find more colorful flowers.","Monarchs are the only insects that travel long distances."],
  infW:["Each monarch memorizes the whole route by flying it once.","Monarchs could easily survive the northern winter if they stayed."],
  ceW:["Monarch butterflies have bright orange wings.","Central Mexico has cool mountain forests.","Every butterfly begins life as a caterpillar."]},
 {text:"Before the safety elevator, almost no one wanted an office above the fourth or fifth floor — too many stairs. In 1854, Elisha Otis demonstrated a brake that would catch a falling elevator car even if its cable snapped. Once people trusted that they would not plunge, buildings began to climb, and the modern skyscraper became possible.",
  main:"A safety brake that made elevators trustworthy is what allowed buildings to rise to great heights.",
  detail:"Otis demonstrated a brake that would catch a falling elevator car even if its cable snapped.",
  infer:"A new technology may take hold only once people trust that it is safe.",
  structure:"It describes a problem, a key invention, and the change the invention made possible.",
  cd:["Skyscrapers became possible mainly because steel grew cheaper.","Elisha Otis invented the very first elevator."],
  infW:["Elevator cables never snap anymore.","Tall buildings would have appeared even without the elevator."],
  ceW:["Climbing many flights of stairs is tiring.","Otis gave his demonstration in 1854.","Modern cities are full of tall buildings."]},
 {text:"When beavers dam a stream, they do far more than build themselves a lodge. The pond that forms behind the dam slows the water, letting sediment settle and creating a wetland where fish, frogs, and birds thrive. In dry spells, that stored water keeps the land green long after unblocked streams have run dry.",
  main:"By damming streams, beavers create wetlands that support wildlife and store water for dry times.",
  detail:"In dry spells, the stored water keeps the land green long after unblocked streams have run dry.",
  infer:"A single species can reshape a landscape in ways that benefit many others.",
  structure:"It corrects a narrow view of an action and then describes its wider effects.",
  cd:["Beavers build dams mainly to show off their engineering skill.","A beaver dam harms nearly every other animal that lives nearby."],
  infW:["Beavers could end every drought if there were simply enough of them.","The pond behind a dam is useful only to the beavers themselves."],
  ceW:["Beavers build lodges to live in.","A beaver has strong front teeth for gnawing wood.","Streams flow downhill toward rivers."]}
];
var STRUCT_POOL=[
 "It presents two opposing arguments and refuses to choose between them.",
 "It lists a series of unrelated facts in no particular order.",
 "It tells a personal anecdote in order to argue against a scientific claim.",
 "It defines a technical term and then traces its long history.",
 "It poses a question and then deliberately leaves it unanswered.",
 "It compares two time periods to argue that nothing has really changed.",
 "It gives step-by-step instructions for completing a task.",
 "It describes a single event and then predicts an unrelated outcome.",
 "It argues for one solution while dismissing every alternative.",
 "It states a popular belief and then confirms it is completely correct.",
 "It weighs several options and finally recommends the cheapest one.",
 "It recounts events in strict order to build toward a surprise.",
 "It quotes an expert and then spends the rest of the passage disagreeing.",
 "It lists the steps of an experiment and reports that it failed."
];
G["central-ideas"]=function(){
  var e=pick(PASS);
  return build("Which choice best states the main idea of the text?", e.main, [e.cd[0], e.cd[1], e.detail],
    "The whole passage develops one central point: "+e.main+" The other choices are too narrow, too broad, or distort what the text says.", 3, e.text);
};
G["inferences"]=function(){
  var e=pick(PASS);
  return build("Which statement can most reasonably be inferred from the text?", e.infer, [e.infW[0], e.infW[1], e.detail],
    "The text best supports this inference: "+e.infer+" One choice is only restated from the passage, and the others go beyond or against what it says.", 4, e.text);
};
G["command-evidence"]=function(){
  var e=pick(PASS);
  return build("Which detail from the text most directly supports the idea that "+e.main.charAt(0).toLowerCase()+e.main.slice(1).replace(/\.$/,"")+"?",
    e.detail, [e.ceW[0], e.ceW[1], e.ceW[2]],
    "This detail directly backs the main point; the other choices are about the same topic but do not support that specific claim.", 4, e.text);
};
G["text-structure"]=function(){
  var e=pick(PASS), ds=shuf(STRUCT_POOL.filter(function(s){return s!==e.structure;})).slice(0,3);
  return build("Which choice best describes the overall structure of the text?", e.structure, ds,
    e.structure.replace(/^It /,"The passage "), 4, e.text);
};

var XTEXT=[
 {t1:"Historian A argues that the printing press was the single most important driver of the Renaissance, spreading new ideas faster than ever before.",
  t2:"Historian B contends that trade networks, not printing, drove the Renaissance; goods and ideas already flowed through busy ports long before books were widely printed.",
  q:"Based on the texts, how would Historian B (Text 2) most likely respond to the claim in Text 1?",
  correct:"By arguing that trade networks, rather than the printing press, were the primary driver.",
  d:["By agreeing that the printing press was the single most important factor.","By concluding that the Renaissance had no cause worth studying.","By insisting that printing and trade were equally unimportant."]},
 {t1:"The author of Text 1 praises remote work for eliminating long commutes and giving employees more control over their day.",
  t2:"The author of Text 2 warns that remote work erodes the casual, in-person conversations where much of a team's creativity is sparked.",
  q:"How does the author of Text 2 respond to the view expressed in Text 1?",
  correct:"By pointing out a downside of remote work that Text 1 does not consider.",
  d:["By fully agreeing with Text 1's praise of remote work.","By denying that anyone actually commutes to work.","By arguing that commutes improve creativity."]},
 {t1:"Text 1 claims that standardized tests give colleges a fair, objective way to compare students from very different schools.",
  t2:"Text 2 argues that test scores mostly track family income, giving wealthier students a built-in advantage.",
  q:"The authors of the two texts would most likely disagree about whether standardized tests are",
  correct:"a fair way to compare students.",
  d:["used by colleges at all.","taken by high school students.","scored on a numerical scale."]},
 {t1:"Text 1 celebrates the reintroduction of wolves to the national park as a way to restore balance to the ecosystem.",
  t2:"Text 2 acknowledges the ecological gains but stresses the real losses suffered by nearby ranchers whose livestock are killed.",
  q:"Compared with Text 1, Text 2 places greater emphasis on",
  correct:"the costs the wolves impose on local ranchers.",
  d:["the ecological benefits of the wolves.","the history of the national park.","the wolves' hunting behavior."]},
 {t1:"Text 1 argues that social media brings people together by keeping distant friends and family in constant contact.",
  t2:"Text 2 counters that social media often leaves users feeling lonelier, as brief online exchanges replace deeper face-to-face connection.",
  q:"Based on the texts, the authors would most likely disagree about whether social media",
  correct:"strengthens people's relationships.",
  d:["is used by many people.","involves online communication.","has grown in recent years."]},
 {t1:"Text 1 argues that nuclear power is the fastest way to cut carbon emissions, since a single plant can run day and night for decades.",
  t2:"Text 2 counters that wind and solar paired with batteries are now cheaper and can be built far more quickly than any reactor.",
  q:"The authors of the two texts would most likely disagree about whether nuclear power is",
  correct:"the best way to cut carbon emissions.",
  d:["a source of electricity at all.","used anywhere in the world.","connected to the climate."]},
 {t1:"The author of Text 1 defends zoos, noting that their breeding programs have saved several species from extinction.",
  t2:"The author of Text 2 argues that no enclosure can replace the wild, and that many animals suffer in captivity.",
  q:"How would the author of Text 2 most likely respond to Text 1's defense of zoos?",
  correct:"By arguing that captivity harms animals in ways breeding programs cannot make up for.",
  d:["By agreeing that zoos are the ideal solution for wildlife.","By denying that any species are actually endangered.","By claiming that zoos attract very few visitors."]},
 {t1:"Text 1 predicts that self-driving cars will sharply reduce accidents by removing human error from the road.",
  t2:"Text 2 warns that self-driving cars can fail in strange ways a human never would, and blur who is responsible in a crash.",
  q:"Compared with Text 1, Text 2 places greater emphasis on",
  correct:"the new risks that self-driving cars introduce.",
  d:["the top speed of self-driving cars.","how popular driving has become.","the rising price of gasoline."]},
 {t1:"Text 1 holds that assigning regular homework reinforces what students learn in class.",
  t2:"Text 2 argues that piling on homework mostly adds stress while doing little to improve understanding.",
  q:"Based on the texts, the authors would most likely disagree about whether homework",
  correct:"meaningfully improves student learning.",
  d:["is assigned by teachers.","is usually done at home.","should exist in any form."]}
];
G["cross-text"]=function(){
  var e=pick(XTEXT);
  return build(e.q, e.correct, e.d, "Text 2 takes a different position from Text 1 on this point.", 4, "Text 1: "+e.t1+"\n\nText 2: "+e.t2);
};

var SYNTH=[
 {notes:["The osprey is a bird of prey.","It hunts almost exclusively fish.","Its reversible outer toe helps it grip slippery prey.","It is found on every continent except Antarctica."],
  goal:"emphasize the osprey's specialization as a fish hunter",
  correct:"The osprey hunts almost exclusively fish, and its reversible outer toe helps it grip slippery prey.",
  d:["The osprey is a bird of prey found on every continent except Antarctica.","Found on nearly every continent, the osprey is a type of bird of prey.","The osprey, a bird of prey, lives almost everywhere on Earth."]},
 {notes:["Bioluminescence is light produced by living organisms.","Many deep-sea fish use it to attract prey.","Fireflies use it to find mates.","Some fungi glow to spread their spores."],
  goal:"illustrate that bioluminescence serves different purposes in different organisms",
  correct:"Bioluminescence serves varied purposes: deep-sea fish use it to attract prey, while fireflies use it to find mates.",
  d:["Bioluminescence is light produced by living organisms such as fish and fireflies.","Many organisms, including fungi, are able to produce their own light.","Bioluminescence, or light made by living things, is common in nature."]},
 {notes:["The Great Wall of China is thousands of miles long.","It was built over many centuries.","Different dynasties added their own sections.","It was meant to defend against northern invasions."],
  goal:"emphasize that the wall was built gradually by many groups over time",
  correct:"Built over many centuries, the Great Wall grew as different dynasties each added their own sections.",
  d:["The Great Wall of China is thousands of miles long and defended against invasions.","The Great Wall was meant to defend China against northern invasions.","The Great Wall of China is one of the longest structures ever built."]},
 {notes:["Tidal power captures energy from the rise and fall of ocean tides.","Tides are highly predictable.","Building tidal plants is expensive.","Few suitable coastal sites exist."],
  goal:"highlight a key advantage of tidal power",
  correct:"A major advantage of tidal power is that tides are highly predictable, unlike many other renewable sources.",
  d:["Tidal power is expensive and limited to a few suitable coastal sites.","Tidal power captures energy from the rise and fall of the tides.","Building tidal power plants can be quite expensive."]},
 {notes:["Sequoias are among the largest trees on Earth.","Their thick bark resists fire.","Fire actually helps their cones release seeds.","They can live for over two thousand years."],
  goal:"emphasize how sequoias benefit from fire",
  correct:"Sequoias are well adapted to fire: their thick bark resists the flames, and the heat helps their cones release seeds.",
  d:["Sequoias are among the largest trees and can live over two thousand years.","Sequoias are enormous trees that can live for more than two thousand years.","Sequoias, some of Earth's largest trees, have unusually thick bark."]},
 {notes:["The Venus flytrap is a carnivorous plant.","It snaps its leaves shut on insects.","It grows in nutrient-poor, boggy soil.","Catching insects gives it nitrogen the soil cannot provide."],
  goal:"explain why the Venus flytrap traps insects",
  correct:"The Venus flytrap catches insects to obtain nitrogen, which its nutrient-poor soil cannot supply.",
  d:["The Venus flytrap is a carnivorous plant that snaps its leaves shut on insects.","Growing in boggy soil, the Venus flytrap is a type of carnivorous plant.","The Venus flytrap, a carnivorous plant, closes its leaves on insects."]},
 {notes:["Concorde was a supersonic passenger jet.","It crossed the Atlantic in about three and a half hours.","Its tickets were extremely expensive.","It was loud and burned enormous amounts of fuel.","It was retired in 2003."],
  goal:"emphasize the drawbacks that led to Concorde's retirement",
  correct:"Concorde was retired largely because it was costly to run, burning enormous amounts of fuel while carrying only high-priced tickets.",
  d:["Concorde was a supersonic jet that crossed the Atlantic in about three and a half hours.","A supersonic jet, Concorde flew passengers from London to New York.","Concorde, retired in 2003, was a remarkably fast aircraft."]},
 {notes:["Coral are tiny animals that build reefs.","They build reefs from calcium carbonate.","Algae live inside coral and share the energy they make.","When water warms, coral expel the algae and can starve."],
  goal:"explain how coral get much of their food",
  correct:"Coral get much of their food from algae that live inside them and share the energy the algae produce.",
  d:["Coral are tiny animals that build reefs out of calcium carbonate.","Building reefs from calcium carbonate, coral are very small animals.","Coral, which build reefs, are tiny animals harmed by warm water."]},
 {notes:["Wind turbines convert wind into electricity.","They produce no emissions while running.","They need a steady, reliable wind.","Their spinning blades can disturb some birds."],
  goal:"highlight a limitation of wind turbines",
  correct:"One limitation of wind turbines is that they require a steady wind and their blades can disturb some birds.",
  d:["Wind turbines convert wind into electricity without producing emissions.","Producing no emissions, wind turbines turn moving air into power.","Wind turbines are machines that generate electricity from the wind."]}
];
G["rhetorical-synthesis"]=function(){
  var e=pick(SYNTH);
  var passage="While researching a topic, a student took the following notes:\n• "+e.notes.join("\n• ");
  return build("The student wants to "+e.goal+". Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    e.correct, e.d, "This choice pulls together the notes that directly serve the goal — to "+e.goal+".", 4, passage);
};

window.ASCEND_GEN = {
  gens:G,
  has:function(sk){ return typeof G[sk]==="function"; },
  make:function(sk){ return G[sk] ? G[sk]() : null; }
};
})();
