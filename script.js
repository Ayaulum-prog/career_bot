const chat = document.getElementById('chat');

let questions = [];
let currentIndex = 0;
let answers = [];
let currentLang = 'ru';

// ===== Локализация =====

const i18n = {
    ru: {
        headerTitle: 'Профориентационный чат-бот',
        headerSubtitle: '«Выбор профессии»',
        statusOnline: 'Онлайн',
        footerText: 'Рекомендации основаны на ваших ответах и не являются окончательным выбором профессии.',
        introTitle: 'Привет!',
        introText: 'Напиши короткое приветствие или своё имя — и я помогу подобрать подходящую сферу и профессии.',
        introPlaceholder: 'Например: Привет, я Аружан',
        introHint: 'Можно просто нажать «Начать тест», если не хочешь писать текст.',
        startBtnText: 'Начать тест',
        defaultUserHello: 'Привет!',
        botHello1: 'Привет! Я помогу тебе сориентироваться в мире профессий.',
        botHello2: 'Ответь, пожалуйста, на несколько коротких вопросов — просто выбирай варианты, которые ближе всего к тебе.',
        analyzing: 'Спасибо! Анализирую ваши ответы...',
        errorPrefix: 'Произошла ошибка: ',
        errorGeneric: 'Произошла ошибка при обработке результатов. Попробуйте позже.',
        noQuestions: 'Вопросы не найдены.',
        loadQuestionsError: 'Не удалось загрузить вопросы. Проверьте сервер.',
        resultIntro: 'По вашим ответам вам может подойти направление: ',
        resultProfessionsTitle: 'Возможные профессии:',
        mapTitle: {
            it: 'IT и программирование',
            med: 'Медицина и помощь людям',
            art: 'Творчество и дизайн',
            eng: 'Инженерия и техника'
        }
    },
    kz: {
        headerTitle: 'Кәсіби бағдар чат-боты',
        headerSubtitle: '«Мамандықты таңдау»',
        statusOnline: 'Онлайн',
        footerText: 'Ұсыныстар сіздің жауаптарыңызға негізделген және соңғы мамандық таңдауы болып табылмайды.',
        introTitle: 'Сәлем!',
        introText: 'Қысқаша сәлемдесу не атыңызды жазып жіберіңіз — мен сізге сәйкес келетін сала мен мамандықтарды ұсынуға тырысамын.',
        introPlaceholder: 'Мысалы: Сәлем, мен Аружанмын',
        introHint: 'Егер жазғыңыз келмесе, жай ғана «Тесті бастау» батырмасын бассаңыз болады.',
        startBtnText: 'Тесті бастау',
        defaultUserHello: 'Сәлем!',
        botHello1: 'Сәлем! Мен саған мамандықтар әлемінде бағдарлануға көмектесемін.',
        botHello2: 'Бірнеше қысқа сұраққа жауап берші — саған ең жақын нұсқаларды таңда.',
        analyzing: 'Рахмет! Жауаптарыңды талдап жатырмын...',
        errorPrefix: 'Қате пайда болды: ',
        errorGeneric: 'Нәтижелерді өңдеу кезінде қате пайда болды. Кейінірек қайталап көріңіз.',
        noQuestions: 'Сұрақтар табылмады.',
        loadQuestionsError: 'Сұрақтарды жүктеу мүмкін болмады. Серверді тексеріңіз.',
        resultIntro: 'Сіздің жауаптарыңызға сәйкес сізге келесі бағыт сәйкес келуі мүмкін: ',
        resultProfessionsTitle: 'Мүмкін мамандықтар:',
        mapTitle: {
            it: 'IT және бағдарламалау',
            med: 'Медицина және адамдарға көмек',
            art: 'Шығармашылық және дизайн',
            eng: 'Инженерия және техника'
        }
    }
};

function applyLanguageTexts() {
    const t = i18n[currentLang];

    document.getElementById('headerTitle').textContent = t.headerTitle;
    document.getElementById('headerSubtitle').textContent = t.headerSubtitle;
    document.getElementById('statusText').textContent = t.statusOnline;
    document.getElementById('footerText').textContent = t.footerText;

    document.getElementById('introTitle').textContent = t.introTitle;
    document.getElementById('introText').textContent = t.introText;
    document.getElementById('introName').placeholder = t.introPlaceholder;
    document.getElementById('introHint').textContent = t.introHint;
    document.getElementById('startBtnText').textContent = t.startBtnText;
}

function setLanguage(lang) {
    if (lang === currentLang) return;
    currentLang = lang;

    // переключаем активную кнопку
    document.getElementById('langRu').classList.toggle('active', lang === 'ru');
    document.getElementById('langKz').classList.toggle('active', lang === 'kz');

    // обновляем тексты
    applyLanguageTexts();

    // сброс чата и возврат на приветственный экран
    chat.innerHTML = '';
    answers = [];
    currentIndex = 0;

    const intro = document.getElementById('intro');
    intro.style.display = 'flex';
    document.getElementById('introName').value = '';
}

// ==== UI: сообщения ====

function addBotMessage(text) {
    const div = document.createElement('div');
    div.className = 'message message-bot';
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'message message-user';
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

// ==== Вопросы ====

function addQuestion(question) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message message-bot';

    const textEl = document.createElement('div');
    textEl.textContent = question.text;
    wrapper.appendChild(textEl);

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'options';

    question.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt.text;
        btn.onclick = () => selectOption(question, opt);
        optionsWrap.appendChild(btn);
    });

    wrapper.appendChild(optionsWrap);
    chat.appendChild(wrapper);
    chat.scrollTop = chat.scrollHeight;
}

function selectOption(question, option) {
    addUserMessage(option.text);
    answers.push(option.category);

    currentIndex++;
    if (currentIndex < questions.length) {
        setTimeout(() => addQuestion(questions[currentIndex]), 400);
    } else {
        finishTest();
    }
}

function finishTest() {
    const t = i18n[currentLang];
    addBotMessage(t.analyzing);

    fetch('api.php?type=recommend&lang=' + currentLang, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({answers})
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                addBotMessage(t.errorPrefix + data.error);
                return;
            }

            const {topCategory, professions, description} = data;
            const mapTitle = t.mapTitle;

            let text = t.resultIntro + (mapTitle[topCategory] || topCategory.toUpperCase()) + '.\n\n';
            text += t.resultProfessionsTitle + '\n- ' + professions.join('\n- ') + '\n\n';
            text += description;

            setTimeout(() => addBotMessage(text), 600);
        })
        .catch(err => {
            console.error(err);
            addBotMessage(t.errorGeneric);
        });
}

function loadQuestionsOnly() {
    const t = i18n[currentLang];

    fetch('api.php?type=questions&lang=' + currentLang)
        .then(res => res.json())
        .then(data => {
            questions = data;
            currentIndex = 0;
            answers = [];

            if (questions.length > 0) {
                addQuestion(questions[0]);
            } else {
                addBotMessage(t.noQuestions);
            }
        })
        .catch(err => {
            console.error(err);
            addBotMessage(t.loadQuestionsError);
        });
}

// ==== Старт с приветствием ====

function startChat() {
    const intro = document.getElementById('intro');
    const input = document.getElementById('introName');
    const t = i18n[currentLang];

    const text = (input.value || '').trim() || t.defaultUserHello;

    // Скрываем стартовый экран
    intro.style.display = 'none';

    // Показываем приветствие пользователя и бота
    addUserMessage(text);
    addBotMessage(t.botHello1);
    addBotMessage(t.botHello2);

    // Загружаем вопросы
    loadQuestionsOnly();
}

// ==== Three.js фон ==== (как у тебя было)

function initBackground() {
    const canvas = document.getElementById('bg');
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 16;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Мягкий синий туман
    scene.fog = new THREE.Fog(0x020617, 10, 40);

    // Свет
    const ambient = new THREE.AmbientLight(0x9fbfff, 0.9);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Геометрии
    const objects = [];
    const palette = [0x1d4ed8, 0x2563eb, 0x38bdf8, 0xf97316, 0x22c55e, 0xa855f7];

    const sphereGeom = new THREE.SphereGeometry(0.7, 24, 24);
    const smallSphereGeom = new THREE.SphereGeometry(0.4, 20, 20);
    const boxGeom = new THREE.BoxGeometry(0.8, 0.6, 0.1);
    const tubeGeom = new THREE.CylinderGeometry(0.25, 0.4, 1.4, 16);

    const geoms = [sphereGeom, smallSphereGeom, boxGeom, tubeGeom];

    for (let i = 0; i < 40; i++) {
        const geom = geoms[Math.floor(Math.random() * geoms.length)];
        const color = palette[Math.floor(Math.random() * palette.length)];
        const material = new THREE.MeshStandardMaterial({
            color,
            metalness: 0.4,
            roughness: 0.25
        });

        const mesh = new THREE.Mesh(geom, material);

        mesh.position.x = (Math.random() - 0.5) * 24;
        mesh.position.y = (Math.random() - 0.5) * 16;
        mesh.position.z = (Math.random() - 0.5) * 18;

        mesh.userData = {
            floatSpeed: 0.4 + Math.random() * 0.6,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02
            },
            baseY: mesh.position.y,
            offset: Math.random() * Math.PI * 2
        };

        scene.add(mesh);
        objects.push(mesh);
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onResize);

    function animate(time) {
        requestAnimationFrame(animate);
        const t = time * 0.001;

        objects.forEach(obj => {
            const d = obj.userData;
            obj.rotation.x += d.rotationSpeed.x;
            obj.rotation.y += d.rotationSpeed.y;
            obj.position.y = d.baseY + Math.sin(t * d.floatSpeed + d.offset) * 0.4;
        });

        renderer.render(scene, camera);
    }

    animate(0);
}

// ==== Инициализация ====

document.addEventListener('DOMContentLoaded', () => {
    // применяем язык по умолчанию
    applyLanguageTexts();

    // Three.js фон
    if (typeof THREE !== 'undefined') {
        initBackground();
    } else {
        console.warn('THREE не найден — фон 3D отключён');
    }

    // Стартовый экран
    const startBtn = document.getElementById('startBtn');
    const introInput = document.getElementById('introName');

    startBtn.addEventListener('click', startChat);
    introInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            startChat();
        }
    });

    // Переключатель языка
    document.getElementById('langRu').addEventListener('click', () => setLanguage('ru'));
    document.getElementById('langKz').addEventListener('click', () => setLanguage('kz'));
});
