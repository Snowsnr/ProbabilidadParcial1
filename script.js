document.addEventListener('DOMContentLoaded', () => {
    let state = {
        good: 15,
        bad: 5
    };

    const elements = {
        countGood: document.getElementById('count-good-input'),
        countBad: document.getElementById('count-bad-input'),
        boxGood: document.getElementById('box-good-count'),
        boxBad: document.getElementById('box-bad-count'),
        totalFuses: document.getElementById('total-fuses'),
        dropZone: document.getElementById('drop-zone'),
        btnDraw: document.getElementById('btn-draw'),
        slot1: document.getElementById('slot-1'),
        slot2: document.getElementById('slot-2'),
        resultText: document.getElementById('draw-result-text'),

        calcDD: document.getElementById('calc-dd'),
        probDD: document.getElementById('prob-dd'),
        calcBB: document.getElementById('calc-bb'),
        probBB: document.getElementById('prob-bb'),
        calcMixed: document.getElementById('calc-mixed'),
        probMixed: document.getElementById('prob-mixed'),
        varN: document.getElementById('var-N'),
        varB: document.getElementById('var-B'),
        varD: document.getElementById('var-D')
    };

    function init() {
        renderBox();
        updateMath();
        setupDragAndDrop();
        setupManualControls();
        setupDrawButton();
    }

    function renderBox() {
        elements.dropZone.innerHTML = '';

        for (let i = 0; i < state.good; i++) {
            elements.dropZone.appendChild(createFuseElement('good'));
        }

        for (let i = 0; i < state.bad; i++) {
            elements.dropZone.appendChild(createFuseElement('bad'));
        }

        elements.countGood.textContent = state.good;
        elements.countBad.textContent = state.bad;
        elements.boxGood.textContent = state.good;
        elements.boxBad.textContent = state.bad;
        elements.totalFuses.textContent = state.good + state.bad;

        elements.btnDraw.disabled = (state.good + state.bad) < 2;
    }

    function createFuseElement(type) {
        const fuse = document.createElement('div');
        fuse.className = `fuse ${type}`;
        const imgSrc = type === 'good' ? 'buenestado.png' : 'defectuoso.png';
        fuse.innerHTML = `<img src="${imgSrc}" alt="Fusible ${type}" class="fuse-img">`;
        return fuse;
    }

    function setupDragAndDrop() {
        const sourceGood = document.getElementById('source-good');
        const sourceBad = document.getElementById('source-bad');

        sourceGood.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('type', 'good');
        });

        sourceBad.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('type', 'bad');
        });

        elements.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.dropZone.classList.add('drag-over');
        });

        elements.dropZone.addEventListener('dragleave', () => {
            elements.dropZone.classList.remove('drag-over');
        });

        elements.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.dropZone.classList.remove('drag-over');
            const type = e.dataTransfer.getData('type');
            if (type === 'good') state.good++;
            if (type === 'bad') state.bad++;

            renderBox();
            updateMath();
        });
    }

    function setupManualControls() {
        document.getElementById('btn-plus-good').addEventListener('click', () => {
            state.good++; renderBox(); updateMath();
        });
        document.getElementById('btn-minus-good').addEventListener('click', () => {
            if (state.good > 0) { state.good--; renderBox(); updateMath(); }
        });
        document.getElementById('btn-plus-bad').addEventListener('click', () => {
            state.bad++; renderBox(); updateMath();
        });
        document.getElementById('btn-minus-bad').addEventListener('click', () => {
            if (state.bad > 0) { state.bad--; renderBox(); updateMath(); }
        });
    }

    function setupDrawButton() {
        elements.btnDraw.addEventListener('click', async () => {
            if (state.good + state.bad < 2) return;

            elements.btnDraw.disabled = true;
            elements.slot1.innerHTML = '?';
            elements.slot2.innerHTML = '?';
            elements.resultText.textContent = 'Extrayendo el primer fusible...';

            let tempGood = state.good;
            let tempBad = state.bad;

            const total = tempGood + tempBad;
            const threshold1 = tempGood / total;
            const rand1 = Math.random();
            const draw1 = rand1 >= threshold1 ? 'bad' : 'good';

            if (draw1 === 'good') tempGood--; else tempBad--;

            const newTotal = tempGood + tempBad;
            const threshold2 = tempGood / newTotal;
            const rand2 = Math.random();
            const draw2 = rand2 >= threshold2 ? 'bad' : 'good';


            await new Promise(r => setTimeout(r, 600));
            elements.slot1.innerHTML = '';
            elements.slot1.appendChild(createFuseElement(draw1));
            elements.slot1.classList.add('animating');
            elements.resultText.textContent = 'Extrayendo el segundo fusible...';

            await new Promise(r => setTimeout(r, 1000));
            elements.slot2.innerHTML = '';
            elements.slot2.appendChild(createFuseElement(draw2));
            elements.slot2.classList.add('animating');
            elements.resultText.textContent = `Resultado: ${translateType(draw1)} y ${translateType(draw2)}`;

            setTimeout(() => {
                elements.slot1.classList.remove('animating');
                elements.slot2.classList.remove('animating');
                elements.btnDraw.disabled = (state.good + state.bad) < 2;
            }, 600);
        });
    }

    function translateType(type) {
        return type === 'good' ? 'Bueno' : 'Defectuoso';
    }

    function updateMath() {
        const G = state.good;
        const B = state.bad;
        const T = G + B;

        if (elements.varN) {
            elements.varN.textContent = T;
            elements.varB.textContent = G;
            elements.varD.textContent = B;
        }

        const ptN = document.querySelector('.val-N');
        const ptB = document.querySelector('.val-B');
        const ptD = document.querySelector('.val-D');
        if (ptN) ptN.textContent = T;
        if (ptB) ptB.textContent = G;
        if (ptD) ptD.textContent = B;

        if (T < 2) {
            resetMathDisplay();
            return;
        }

        const pDD1 = B / T;
        const pDD2 = (B - 1) / (T - 1);
        const pDD = pDD1 * pDD2;

        elements.calcDD.innerHTML = `$$ \\frac{${B}}{${T}} \\cdot \\frac{${B - 1}}{${T - 1}} $$`;
        elements.probDD.textContent = formatProb(pDD);

        const pGG1 = G / T;
        const pGG2 = (G - 1) / (T - 1);
        const pGG = pGG1 * pGG2;

        elements.calcBB.innerHTML = `$$ \\frac{${G}}{${T}} \\cdot \\frac{${G - 1}}{${T - 1}} $$`;
        elements.probBB.textContent = formatProb(pGG);

        const pGD = (G / T) * (B / (T - 1));
        const pDG = (B / T) * (G / (T - 1));
        const pMixed = pGD + pDG;

        elements.calcMixed.innerHTML = `$$ \\left(\\frac{${G}}{${T}} \\cdot \\frac{${B}}{${T - 1}}\\right) + \\left(\\frac{${B}}{${T}} \\cdot \\frac{${G}}{${T - 1}}\\right) $$`;
        elements.probMixed.textContent = formatProb(pMixed);

        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([elements.calcDD, elements.calcBB, elements.calcMixed]);
        }
    }

    function resetMathDisplay() {
        elements.calcDD.innerHTML = '$$ ... $$';
        elements.probDD.textContent = '= 0.0000 = 0.00%';
        elements.calcBB.innerHTML = '$$ ... $$';
        elements.probBB.textContent = '= 0.0000 = 0.00%';
        elements.calcMixed.innerHTML = '$$ ... $$';
        elements.probMixed.textContent = '= 0.0000 = 0.00%';
        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([elements.calcDD, elements.calcBB, elements.calcMixed]);
        }
    }

    function formatProb(value) {
        if (isNaN(value)) return '= 0.0000 = 0.00%';
        return '= ' + value.toFixed(4) + ' = ' + (value * 100).toFixed(2) + '%';
    }

    init();
});
