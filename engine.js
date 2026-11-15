/* Moteur de prédiction des groupes : même transformation que le notebook, puis centroïde le plus proche (distance euclidienne). */
const Engine = (() => {
  function transform(meta, raw) {
    const t = meta.transform, x = Float64Array.from(raw);
    if (t.kind === 'norm') { let s = 0; for (const v of x) s += v * v; s = Math.sqrt(s); if (s > 0) for (let i = 0; i < x.length; i++) x[i] /= s; }
    else if (t.kind === 'std') for (let i = 0; i < x.length; i++) x[i] = (x[i] - t.mean[i]) / t.scale[i];
    return x;
  }
  function predict(meta, raw) {
    const x = transform(meta, raw), dist = meta.centroids.map(c => { let s = 0; for (let i = 0; i < c.length; i++) { const d = x[i] - c[i]; s += d * d; } return Math.sqrt(s); });
    let b = 0; for (let g = 1; g < dist.length; g++) if (dist[g] < dist[b]) b = g;
    const dmin = dist[b], prox = dist.map(d => d === 0 ? 1 : dmin / d);
    const mp = meta.map, c = x.map((v, i) => v - mp.mean[i]), xy = mp.comps.map(w => w.reduce((a, wi, i) => a + wi * c[i], 0));
    return { xy, index: b, label: meta.groups[b].name, group: meta.groups[b], dist, prox };
  }
  return { predict };
})();
