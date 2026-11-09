// TeleSus — hospitais próximos via Geoapify Places API.
// Configure uma chave restrita ao domínio autorizado no arquivo TeleSusGeoapifyConfig.js.
function carregarHospitaisPerto(area) {
  area.innerHTML = `
    <section class="hospitais-painel">
      <h2>Hospitais perto</h2>
      <p>Encontre hospitais cadastrados no serviço Geoapify, com dados de mapas colaborativos.</p>
      <div class="hospitais-aviso" role="note"><strong>Em caso de emergência:</strong> procure atendimento imediato ou ligue para o SAMU <a href="tel:192">192</a>. A busca não confirma pronto atendimento, horários ou vagas.</div>
      <button type="button" class="hospitais-localizar" id="hospitaisLocalizar">📍 Usar minha localização</button>
      <p class="hospitais-status" id="hospitaisStatus" role="status" aria-live="polite">Sua localização será solicitada somente ao clicar no botão.</p>
      <div id="hospitaisResultados" class="hospitais-resultados"></div>
    </section>`;

  const botao = area.querySelector('#hospitaisLocalizar');
  const status = area.querySelector('#hospitaisStatus');
  const resultados = area.querySelector('#hospitaisResultados');
  const chave = (window.TELESUS_GEOAPIFY_KEY || '').trim();
  const CACHE_MS = 10 * 60 * 1000;
  let numeroBusca = 0;

  function mensagem(texto) { status.textContent = texto; }
  function distanciaKm(lat1, lon1, lat2, lon2) {
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return 12742 * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  function montarUnidades(features, lat, lon) {
    const itens = (features || []).map((feature) => {
      const p = feature.properties || {};
      const coords = feature.geometry?.coordinates || [];
      const longitude = Number(p.lon ?? coords[0]);
      const latitude = Number(p.lat ?? coords[1]);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
      return {
        id: String(p.place_id || `${latitude.toFixed(5)}:${longitude.toFixed(5)}:${p.name || ''}`),
        nome: p.name || 'Hospital sem nome informado',
        endereco: p.formatted || [p.address_line1, p.address_line2].filter(Boolean).join(', '),
        lat: latitude, lon: longitude,
        distancia: distanciaKm(lat, lon, latitude, longitude)
      };
    }).filter(Boolean);
    return [...new Map(itens.map(item => [item.id, item])).values()]
      .sort((a, b) => a.distancia - b.distancia).slice(0, 15);
  }
  function mostrarUnidades(unidades, raio) {
    resultados.replaceChildren();
    if (!unidades.length) {
      mensagem(`Nenhum hospital cadastrado encontrado até ${raio / 1000} km. Isso não significa que não existam unidades na região.`);
      return;
    }
    mensagem(`${unidades.length} hospital(is) encontrado(s) em até ${raio / 1000} km. Distâncias em linha reta; confirme os serviços antes de ir.`);
    unidades.forEach(unidade => {
      const cartao = document.createElement('article');
      cartao.className = 'hospitais-item';
      const titulo = document.createElement('h3');
      titulo.textContent = unidade.nome;
      const detalhes = document.createElement('p');
      detalhes.textContent = `${unidade.distancia.toFixed(1).replace('.', ',')} km em linha reta • ${unidade.endereco || 'Endereço não informado'}`;
      const rota = document.createElement('a');
      rota.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${unidade.lat},${unidade.lon}`)}`;
      rota.target = '_blank'; rota.rel = 'noopener noreferrer';
      rota.textContent = 'Abrir rota no Google Maps';
      cartao.append(titulo, detalhes, rota);
      resultados.appendChild(cartao);
    });
  }
  function alternativa(lat, lon) {
    if (resultados.querySelector('.hospitais-alternativa')) return;
    const p = document.createElement('p');
    p.className = 'hospitais-alternativa';
    const link = document.createElement('a');
    link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`hospitais e UPA perto de ${lat},${lon}`)}`;
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = 'Pesquisar hospitais e UPAs no Google Maps';
    p.append('Se preferir, ', link, '.');
    resultados.appendChild(p);
  }
  async function consultar(lat, lon, raio, signal) {
    const url = new URL('https://api.geoapify.com/v2/places');
    url.searchParams.set('categories', 'healthcare.hospital');
    url.searchParams.set('filter', `circle:${lon},${lat},${raio}`);
    url.searchParams.set('bias', `proximity:${lon},${lat}`);
    url.searchParams.set('limit', '25');
    url.searchParams.set('apiKey', chave);
    const resposta = await fetch(url.toString(), { signal });
    if (!resposta.ok) {
      const erro = new Error(`Geoapify HTTP ${resposta.status}`);
      erro.status = resposta.status;
      throw erro;
    }
    const dados = await resposta.json();
    return montarUnidades(dados.features, lat, lon);
  }
  botao.addEventListener('click', () => {
    if (!chave || chave === 'COLE_SUA_CHAVE_AQUI') {
      mensagem('Falta configurar a chave Geoapify no arquivo TeleSusGeoapifyConfig.js. Consulte o LEIA-ME do pacote.');
      return;
    }
    if (!navigator.geolocation || !window.isSecureContext) {
      mensagem('A localização exige navegador compatível e acesso via localhost ou HTTPS.');
      return;
    }
    const busca = ++numeroBusca;
    botao.disabled = true;
    resultados.replaceChildren();
    mensagem('Solicitando sua localização…');
    navigator.geolocation.getCurrentPosition(async posicao => {
      const lat = posicao.coords.latitude;
      const lon = posicao.coords.longitude;
      const chaveCache = `TeleSusHospitaisGeo_${lat.toFixed(2)}_${lon.toFixed(2)}`;
      try {
        const salvo = JSON.parse(sessionStorage.getItem(chaveCache) || 'null');
        if (salvo && Date.now() - salvo.quando < CACHE_MS && Array.isArray(salvo.unidades)) {
          mostrarUnidades(salvo.unidades, salvo.raio);
          alternativa(lat, lon);
          return;
        }
      } catch (_) { /* Cache indisponível: segue consulta */ }

      const controlador = new AbortController();
      const temporizador = setTimeout(() => controlador.abort(), 12000);
      try {
        let unidades = [];
        let raioFinal = 3000;
        for (const raio of [3000, 6000, 10000]) {
          if (busca !== numeroBusca || !area.isConnected) return;
          mensagem(`Buscando hospitais em até ${raio / 1000} km…`);
          unidades = await consultar(lat, lon, raio, controlador.signal);
          raioFinal = raio;
          if (busca !== numeroBusca || !area.isConnected) return;
          mostrarUnidades(unidades, raio);
          if (unidades.length >= 5) break;
        }
        try { sessionStorage.setItem(chaveCache, JSON.stringify({ quando: Date.now(), unidades, raio: raioFinal })); } catch (_) {}
        alternativa(lat, lon);
      } catch (erro) {
        if (busca !== numeroBusca || !area.isConnected) return;
        if (erro.name === 'AbortError') mensagem('A pesquisa demorou mais que o esperado. Você pode tentar novamente ou usar o Google Maps.');
        else if (erro.status === 401 || erro.status === 403) mensagem('Chave Geoapify inválida, sem permissão ou com restrição de domínio. Confira sua configuração.');
        else if (erro.status === 429) mensagem('Limite de consultas da Geoapify atingido. Tente mais tarde.');
        else mensagem('Não foi possível consultar os hospitais. Verifique sua conexão e a chave da API.');
        alternativa(lat, lon);
        console.error('TeleSus / Geoapify:', erro);
      } finally {
        clearTimeout(temporizador);
        if (busca === numeroBusca && area.isConnected) botao.disabled = false;
      }
    }, erro => {
      if (busca !== numeroBusca || !area.isConnected) return;
      mensagem(erro.code === 1 ? 'Localização não autorizada. Permita o acesso no navegador.' : 'Não foi possível obter sua localização. Verifique as permissões e tente novamente.');
      botao.disabled = false;
    }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
  });
}
