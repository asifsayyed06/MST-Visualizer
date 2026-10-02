let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
let N=8,nodes=[],edges=[],K=[],P=[],ks=0,ps=0,timer=null;
const $=id=>document.getElementById(id);
function gen(){seed=Math.floor(Math.random()*1e6)+1;N=+$('n').value;nodes=[];let g=0;
 while(nodes.length<N){const p={x:35+rnd()*430,y:35+rnd()*250};if(nodes.every(q=>Math.hypot(p.x-q.x,p.y-q.y)>65)||++g>600)nodes.push(p)}
 const all=[];for(let i=0;i<N;i++)for(let j=i+1;j<N;j++)all.push({u:i,v:j,d:Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y)});
 all.sort((a,b)=>a.d-b.d);const par=[...Array(N).keys()],f=x=>par[x]==x?x:par[x]=f(par[x]);edges=[];
 for(const e of all){const a=f(e.u),b=f(e.v);if(a!=b){par[a]=b;edges.push(e)}else if(rnd()<.3&&e.d<230)edges.push(e)}
 edges.forEach((e,i)=>{e.id=i;e.w=Math.max(1,Math.round(e.d/10))});
 build()}
function kruskal(){const s=[],par=[...Array(N).keys()],f=x=>par[x]==x?x:par[x]=f(par[x]);
 const E=[...edges].sort((a,b)=>a.w-b.w);let ops=Math.ceil(E.length*Math.log2(E.length)),add=0,tot=0;
 for(const e of E){ops+=2;const a=f(e.u),b=f(e.v);
  if(a!=b){par[a]=b;add++;tot+=e.w;s.push({e,t:'add',ops,tot,msg:`Edge ${e.u}–${e.v} (w=${e.w}) connects two components → added.`})}
  else s.push({e,t:'skip',ops,tot,msg:`Edge ${e.u}–${e.v} (w=${e.w}) would form a cycle → skipped.`});
  if(add==N-1)break}return s}
function prim(){const s=[],vis=new Set([0]);let ops=0,tot=0;
 while(vis.size<N){let best=null;
  for(const e of edges){if(vis.has(e.u)!=vis.has(e.v)){ops++;if(!best||e.w<best.w)best=e}}
  vis.add(vis.has(best.u)?best.v:best.u);tot+=best.w;
  s.push({e:best,t:'add',ops,tot,msg:`Cheapest edge leaving the tree: ${best.u}–${best.v} (w=${best.w}) → added.`})}return s}
function draw(svg,steps,k,mode){
 const done=steps.slice(0,k),cur=done[k-1],add=new Set(),skip=new Set(),inT=new Set(mode=='p'?[0]:[]);
 done.forEach(s=>{if(s.t=='add'){add.add(s.e.id);inT.add(s.e.u);inT.add(s.e.v)}else skip.add(s.e.id)});
 let h='';
 for(const e of edges){const a=nodes[e.u],b=nodes[e.v];let c='var(--line)',w=1.2,d='';
  if(mode=='r'){if(!steps.slice(0,k).some(s=>s.t=='add'&&s.e.id==e.id))continue;c='var(--ok)';w=4}
  else{if(add.has(e.id)){c='var(--ok)';w=4}else if(skip.has(e.id)){c='var(--bad)';d='5 4';w=1.6}
   if(cur&&cur.e.id==e.id){c=cur.t=='add'?'var(--ok)':'var(--bad)';w=5.5}}
  h+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${d}" stroke-linecap="round"/>`;
  h+=`<text x="${(a.x+b.x)/2}" y="${(a.y+b.y)/2+4}" font-size="11" text-anchor="middle" fill="var(--tx)" stroke="var(--card)" stroke-width="3" paint-order="stroke">${e.w}</text>`}
 nodes.forEach((p,i)=>{const on=inT.has(i);h+=`<circle cx="${p.x}" cy="${p.y}" r="13" fill="${on?'var(--ok)':'var(--card)'}" stroke="${on?'var(--ok)':'var(--mu)'}" stroke-width="2"/><text x="${p.x}" y="${p.y+4}" font-size="12" text-anchor="middle" font-weight="600" fill="${on?'#fff':'var(--tx)'}">${i}</text>`});
 svg.innerHTML=h}
function stats(id,mid,steps,k){const c=steps[k-1]||{ops:0,tot:0,msg:'Press Step or Play.'};
 $(id).innerHTML=`<span>Steps <b>${k}/${steps.length}</b></span><span>Weight <b>${c.tot}</b></span><span>Ops ≈ <b>${c.ops}</b></span>`;$(mid).textContent=c.msg}
function render(){draw($('k'),K,ks,'k');draw($('p'),P,ps,'p');stats('ks','km',K,ks);stats('ps','pm',P,ps);$('kpg').style.width=(K.length?ks/K.length*100:0)+'%';$('ppg').style.width=(P.length?ps/P.length*100:0)+'%';result()}
function result(){const w=$('resw');if(!K.length){w.className='msg';w.innerHTML='<span class="warn">Add at least 2 nodes and connect them all to see a result.</span>';$('resc').classList.remove('win');return}w.className='msg';
 if(ks<K.length||ps<P.length){w.innerHTML='Run both algorithms to the end (Play or “Skip to result”) to see the comparison.';$('resc').classList.remove('win');return}
 const kf=K[K.length-1],pf=P[P.length-1],m=edges.length,dens=m/(N*(N-1)/2);
 const win=kf.ops<pf.ops?'Kruskal':pf.ops<kf.ops?'Prim':'Tie (Kruskal / Prim)';
 const why=win=='Kruskal'?'It needed fewer operations here — sparse graphs favour sorting the few edges.':win=='Prim'?'It needed fewer operations here — dense graphs favour growing one tree.':'Both did the same amount of work.';
 $('resc').classList.add('win');
 w.className='';w.innerHTML=`<div class="res"><div><svg id="rs" viewBox="0 0 500 320"></svg></div><div>
 <span class="badge">Best for this graph: ${win}</span><p>${why}</p>
 <table><tr><th></th><th>Kruskal</th><th>Prim</th></tr><tr><td>MST weight</td><td>${kf.tot}</td><td>${pf.tot}</td></tr><tr><td>Steps</td><td>${K.length}</td><td>${P.length}</td></tr><tr><td>Edges rejected</td><td>${K.length-(N-1)}</td><td>0</td></tr><tr><td>Approx. ops</td><td>${kf.ops}</td><td>${pf.ops}</td></tr></table>
 <div class="msg">${N} nodes, ${m} edges, density ${(dens*100).toFixed(0)}%. ${kf.tot==pf.tot?'Both found an MST of the same minimum weight '+kf.tot+'.':''} The green graph is the optimal MST.</div></div></div>`;
 draw($('rs'),K,K.length,'r')}
let sel=null;
function build(){N=nodes.length;edges.forEach((e,i)=>e.id=i);const par=[...Array(N).keys()],f=x=>par[x]==x?x:par[x]=f(par[x]);edges.forEach(e=>par[f(e.u)]=f(e.v));
 const ok=N>1&&nodes.every((_,i)=>f(i)==f(0));K=ok?kruskal():[];P=ok?prim():[];reset();drawB();
 $('bh').innerHTML=ok?`Graph ready: ${N} nodes, ${edges.length} edges. Click empty space to add a node · click two nodes to connect them (weight box = custom weight, blank = distance).`:'<span class="warn">Not connected yet — connect every node with at least one edge to run the algorithms.</span>'}
function drawB(){let h='';for(const e of edges){const a=nodes[e.u],b=nodes[e.v];h+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="var(--mu)" stroke-width="2"/><text x="${(a.x+b.x)/2}" y="${(a.y+b.y)/2-5}" font-size="11" text-anchor="middle" fill="var(--tx)" stroke="var(--bg)" stroke-width="3" paint-order="stroke">${e.w}</text>`}
 nodes.forEach((p,i)=>{h+=`<circle cx="${p.x}" cy="${p.y}" r="13" fill="${sel===i?'var(--ac)':'var(--card)'}" stroke="var(--ac)" stroke-width="2"/><text x="${p.x}" y="${p.y+4}" font-size="12" text-anchor="middle" font-weight="600" fill="${sel===i?'#fff':'var(--tx)'}">${i}</text>`});$('bs').innerHTML=h}
$('bs').onclick=ev=>{stop();const r=$('bs').getBoundingClientRect(),x=(ev.clientX-r.left)*500/r.width,y=(ev.clientY-r.top)*320/r.height;
 const i=nodes.findIndex(p=>Math.hypot(p.x-x,p.y-y)<17);
 if(i<0){if(nodes.length>=14){$('bh').textContent='Maximum 14 nodes.';return}sel=null;nodes.push({x,y})}
 else if(sel===null){sel=i;drawB();return}
 else if(sel!==i){if(!edges.some(e=>(e.u==sel&&e.v==i)||(e.u==i&&e.v==sel))){const d=Math.hypot(nodes[sel].x-nodes[i].x,nodes[sel].y-nodes[i].y),v=+$('ew').value;edges.push({u:sel,v:i,d,w:v>0?Math.round(v):Math.max(1,Math.round(d/10))})}sel=null}
 else sel=null;
 build()};
$('undo').onclick=()=>{edges.pop();build()};
$('clr').onclick=()=>{nodes=[];edges=[];sel=null;build()};
function tick(){let moved=false;if(ks<K.length){ks++;moved=true}if(ps<P.length){ps++;moved=true}render();if(!moved)stop()}
function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ Play'}
function reset(){stop();ks=ps=0;render()}
$('play').onclick=()=>{if(timer)return stop();if(ks>=K.length&&ps>=P.length)reset();$('play').textContent='⏸ Pause';timer=setInterval(tick,1100-$('sp').value*100)};
$('step').onclick=()=>{stop();tick()};
$('fin').onclick=()=>{stop();ks=K.length;ps=P.length;render()};
$('rst').onclick=reset;$('new').onclick=gen;
$('n').oninput=()=>{$('nv').textContent=$('n').value;gen()};
$('sp').oninput=()=>{if(timer){stop();$('play').click()}};
/* Chatbot knowledge base */
const KB=[
[['what is','definition','define','mst','minimum spanning','spanning tree'],'A spanning tree of a connected, undirected, weighted graph is a subset of edges that connects all V vertices with no cycles (exactly V−1 edges). A Minimum Spanning Tree (MST) is the spanning tree with the smallest possible total edge weight.'],
[['kruskal'],'Kruskal’s algorithm (greedy, edge-based): 1) sort all edges by weight; 2) go through them in order, adding an edge if it connects two different components (checked with Union-Find), otherwise skip it; 3) stop at V−1 edges. Time O(E log E) = O(E log V). Great for sparse graphs.'],
[['prim'],'Prim’s algorithm (greedy, vertex-based): start from any vertex; repeatedly add the cheapest edge that connects the tree to a vertex outside it. With a binary heap: O(E log V); with a Fibonacci heap: O(E + V log V); with an adjacency matrix: O(V²). Great for dense graphs.'],
[['boruvka','borůvka','boruvka'],'Borůvka’s algorithm: in each round every component picks its cheapest outgoing edge and all those edges are added, merging components. At least halves the component count each round → O(E log V). Oldest MST algorithm (1926) and easy to parallelize.'],
[['reverse delete','reverse-delete'],'Reverse-delete: start with the whole graph, consider edges from heaviest to lightest and remove an edge unless removing it disconnects the graph. Result is an MST. Typically O(E log V (log log V)³).'],
[['cut property','cut'],'Cut property: for any cut of the graph, the lightest edge crossing the cut belongs to some MST (to every MST if it is unique). This is why Prim’s and Borůvka’s greedy choices are safe.'],
[['cycle property','cycle'],'Cycle property: in any cycle, the heaviest edge (if strictly heavier than the others) is not in any MST. This is why Kruskal rejects edges that would close a cycle, and why reverse-delete works.'],
[['union','find','disjoint','dsu'],'Union-Find (disjoint-set union) tracks which vertices share a component. find(x) returns the component root, union(a,b) merges two. With path compression + union by rank each op costs O(α(n)) — effectively constant — so Kruskal is dominated by sorting.'],
[['complexity','time','big o','runtime','fast','faster'],'Kruskal: O(E log E). Prim (binary heap): O(E log V). Prim (Fibonacci heap): O(E + V log V). Prim (matrix): O(V²). Borůvka: O(E log V). Best known: Chazelle’s near-linear O(E·α(E,V)); a randomized Karger–Klein–Tarjan algorithm runs in expected O(E).'],
[['which','best','compare','difference','vs','versus','better','choose','when'],'Kruskal vs Prim: Kruskal works on edges (sort + Union-Find), can handle disconnected graphs (giving a forest) and shines on sparse graphs. Prim grows a single tree from one vertex, needs a connected graph, and shines on dense graphs. Both give an MST of the same total weight. The visualizer above counts approximate operations to pick a winner on your graph.'],
[['unique','multiple','distinct','tie','same weight'],'If all edge weights are distinct, the MST is unique. With equal weights there can be several different MSTs — but all have the same total weight.'],
[['edge count','how many edges','v-1','v - 1','n-1'],'Every spanning tree of a graph with V vertices has exactly V−1 edges. Fewer edges would leave it disconnected; more would create a cycle.'],
[['disconnected','forest','not connected'],'A disconnected graph has no spanning tree, but has a minimum spanning forest: one MST per connected component. Kruskal handles this naturally; Prim must be restarted from a vertex in each component.'],
[['negative','negative weight'],'MST algorithms work fine with negative (and zero) weights, since only the relative order of weights matters. Adding a constant to all weights does not change which tree is the MST.'],
[['directed','digraph','arborescence','edmonds','chu'],'For directed graphs the analogue is the minimum-cost arborescence, solved by the Chu–Liu/Edmonds algorithm in O(VE) (O(E + V log V) with advanced structures). Kruskal and Prim do not apply directly.'],
[['dijkstra','shortest path','shortest'],'MST ≠ shortest-path tree. An MST minimizes the total weight of all edges; Dijkstra’s tree minimizes each vertex’s distance from a source. They can differ, even though Prim and Dijkstra have almost identical code (Prim uses edge weight as the key, Dijkstra uses distance from the source).'],
[['application','use','real world','real-world','used for','uses'],'Applications: network design (cables, pipelines, roads, electrical grids), clustering (single-linkage), image segmentation, approximating the Travelling Salesman Problem (2-approximation for metric TSP), circuit design, and taxonomy/phylogenetic trees.'],
[['cluster','clustering'],'Single-linkage clustering: build the MST, then delete the k−1 heaviest edges to get k clusters. This is exactly Kruskal stopped early when k components remain.'],
[['tsp','travelling','traveling','salesman','approximat'],'For metric TSP, a tour of an MST (DFS preorder with shortcutting) is at most 2× the optimal tour length — a classic 2-approximation. Christofides improves this to 1.5×.'],
[['count','number of spanning','cayley','kirchhoff','matrix tree'],'Cayley’s formula: the complete graph Kₙ has n^(n−2) spanning trees. For general graphs, Kirchhoff’s Matrix-Tree Theorem counts them as any cofactor of the Laplacian matrix.'],
[['proof','prove','correct','why does','greedy'],'Proof sketch (exchange argument): suppose an optimal tree T lacks the greedy edge e (lightest across a cut). Adding e to T makes a cycle that crosses the cut elsewhere with some edge f ≥ e. Swapping f for e gives a tree no heavier — so e is in some MST. Induction finishes the proof.'],
[['steiner'],'The Steiner tree problem asks for the cheapest tree connecting only a required subset of vertices (extra “Steiner” vertices allowed). Unlike MST it is NP-hard; an MST on the terminals’ metric closure gives a 2-approximation.'],
[['history','who invented','invented','origin'],'Borůvka (1926) designed the first MST algorithm for electrifying Moravia. Jarník (1930) found what Prim (1957) and Dijkstra (1959) later rediscovered. Kruskal published his in 1956.'],
[['code','python','implement','pseudocode','program'],'Kruskal (Python):\nparent=list(range(n))\ndef find(x):\n  while parent[x]!=x:\n    parent[x]=parent[parent[x]]; x=parent[x]\n  return x\nmst=[]\nfor w,u,v in sorted(edges):\n  a,b=find(u),find(v)\n  if a!=b: parent[a]=b; mst.append((u,v,w))\n\nPrim (Python):\nimport heapq\nseen={0}; h=[(w,0,v) for v,w in adj[0]]; heapq.heapify(h); mst=[]\nwhile h and len(seen)<n:\n  w,u,v=heapq.heappop(h)\n  if v in seen: continue\n  seen.add(v); mst.append((u,v,w))\n  for x,wx in adj[v]: heapq.heappush(h,(wx,v,x))'],
[['space','memory'],'Space: Kruskal O(E) for the sorted edge list + O(V) Union-Find. Prim O(V + E) with an adjacency list and heap, O(V²) with a matrix.'],
[['visualizer','app','this','colors','color','green','red','ops','operations'],'In the visualizer: green edges/nodes are in the tree, red dashed edges were rejected by Kruskal (cycle), the thick highlighted edge is the current step. “Ops” is an approximation: Kruskal = sort comparisons + 2 find calls per edge examined; Prim = candidate edges compared while picking the cheapest crossing edge.'],
[['hello','hi','hey'],'Hi! Ask me anything about Minimum Spanning Trees — algorithms, proofs, complexity, applications, or the graph you are looking at.']
];
const sugg=['What is an MST?','Explain Kruskal','Explain Prim','Kruskal vs Prim?','Cut property','Time complexity','Show Python code','Applications'];
function ask(q){const t=q.toLowerCase();
 if(/this graph|my graph|result|total weight|current/.test(t)){if(ks>=K.length&&ps>=P.length){const a=K[K.length-1],b=P[P.length-1];return`For the current graph (${N} nodes, ${edges.length} edges): MST weight = ${a.tot}. Kruskal took ${K.length} steps (~${a.ops} ops), Prim ${P.length} steps (~${b.ops} ops). See the Result panel for the winner.`}return'Run both algorithms to the end first (Play or “Skip to result”), then ask again and I will summarize the result.'}
 let best=null,bs=0;for(const [keys,ans] of KB){let s=0;for(const k of keys)if(t.includes(k))s+=k.length;if(s>bs){bs=s;best=ans}}
 return best||'I can answer questions about MST definitions, Kruskal, Prim, Borůvka, cut/cycle properties, Union-Find, complexity, proofs, uniqueness, applications, clustering, TSP, and Python code. Try one of the suggestions below.'}
function add(c,t){const d=document.createElement('div');d.className='m '+c;d.textContent=t;$('log').appendChild(d);$('log').scrollTop=1e9}
function send(q){q=(q||$('q').value).trim();if(!q)return;add('u',q);$('q').value='';add('b',ask(q))}
$('send').onclick=()=>send();$('q').onkeydown=e=>{if(e.key=='Enter')send()};
sugg.forEach(s=>{const b=document.createElement('button');b.textContent=s;b.onclick=()=>send(s);$('chips').appendChild(b)});
add('b',ask('hello'));gen();