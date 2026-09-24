// ============================================
// 本地存储版（不需要登录、不需要网络）
// ============================================
const STORAGE_KEY = 'dish_records_app';
const FRIDGE_KEY = 'fridge_items';
const CALENDAR_KEY = 'cook_calendar';
const PROFILE_KEY = 'user_profile';
const WEIGHT_KEY = 'weight_records';
const EXERCISE_KEY = 'exercise_records';

let recipes = [];
let currentPage = 1;
const PAGE_SIZE = 10;
let fridgeItems = [];
let currentImageBase64 = null;
let editingId = null;
let activeCategory = 'all';
let manageMode = false;
let selectedIds = new Set();
let pickerRecipeId = null;
let guestSelectedIds = new Set();
let ocrImageBase64 = null;
let ocrWorker = null;
let fridgeOcrImageBase64 = null;
let confirmCallback = null;
let guestList = [];
let isGuestMode = false;

// 新功能状态
let cookCalendar = [];        // [{ id, date, recipeId, recipeName, note, planned }]
let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();
let userProfile = { avatar: null, nickname: '', height: 170 };
let weightRecords = [];       // [{ id, date, weight }]
let exerciseRecords = [];     // [{ id, date, type, duration }]
let fridgeEditingId = null;

// ============================================
// DOM 缓存
// ============================================
const appContainer = document.getElementById('appContainer');
const previewImg = document.getElementById('previewImg');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const previewContainer = document.getElementById('previewContainer');
const imageInput = document.getElementById('imageInput');
const dishNameInput = document.getElementById('dishName');
const stepsInput = document.getElementById('steps');
const saveBtn = document.getElementById('saveBtn');
const recipeListEl = document.getElementById('recipeList');
const recipeCountEl = document.getElementById('recipeCount');
const toastEl = document.getElementById('toast');
const formTitle = document.getElementById('formTitle');
const formIcon = document.getElementById('formIcon');
const editBanner = document.getElementById('editBanner');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const pasteInput = document.getElementById('pasteInput');
const extractBtn = document.getElementById('extractBtn');
const clearPasteBtn = document.getElementById('clearPasteBtn');
const categoryBar = document.getElementById('categoryBar');
const manageModeToggle = document.getElementById('manageModeToggle');
const selectAllBtn = document.getElementById('selectAllBtn');
const batchDelBtn = document.getElementById('batchDelBtn');
const selectedCount = document.getElementById('selectedCount');
const categoryPickerOverlay = document.getElementById('categoryPickerOverlay');
const pickerSubtitle = document.getElementById('pickerSubtitle');
const pickerGrid = document.getElementById('pickerGrid');
const pickerCancelBtn = document.getElementById('pickerCancelBtn');
const shareBtn = document.getElementById('shareBtn');
const shareOverlay = document.getElementById('shareOverlay');
const shareOptions = document.getElementById('shareOptions');
const shareLinkBox = document.getElementById('shareLinkBox');
const shareLinkInfo = document.getElementById('shareLinkInfo');
const shareCancelBtn = document.getElementById('shareCancelBtn');
const shareConfirmBtn = document.getElementById('shareConfirmBtn');
const shareSelectedCount = document.getElementById('shareSelectedCount');
const shareWithImages = document.getElementById('shareWithImages');
const guestRecipeList = document.getElementById('guestRecipeList');
const guestCartBar = document.getElementById('guestCartBar');
const guestCartCount = document.getElementById('guestCartCount');
const guestSubmitBtn = document.getElementById('guestSubmitBtn');
const guestTitle = document.getElementById('guestTitle');
const guestDesc = document.getElementById('guestDesc');
const fabBtn = document.getElementById('fabBtn');
const headerAddBtn = document.getElementById('headerAddBtn');
const formOverlay = document.getElementById('formOverlay');
const sheetCloseBtn = document.getElementById('sheetCloseBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');
const fridgeBtn = document.getElementById('fridgeBtn');
const fridgeOverlay = document.getElementById('fridgeOverlay');
const fridgeCloseBtn = document.getElementById('fridgeCloseBtn');
const fridgeInput = document.getElementById('fridgeInput');
const fridgeAddBtn = document.getElementById('fridgeAddBtn');
const fridgeList = document.getElementById('fridgeList');
const fridgeCount = document.getElementById('fridgeCount');
const fridgeClearBtn = document.getElementById('fridgeClearBtn');
const fridgeOcrPickBtn = document.getElementById('fridgeOcrPickBtn');
const fridgeOcrFileInput = document.getElementById('fridgeOcrFileInput');
const fridgeOcrPreview = document.getElementById('fridgeOcrPreview');
const fridgeOcrPreviewImg = document.getElementById('fridgeOcrPreviewImg');
const fridgeOcrRemoveBtn = document.getElementById('fridgeOcrRemoveBtn');
const fridgeOcrProgress = document.getElementById('fridgeOcrProgress');
const fridgeOcrProgressFill = document.getElementById('fridgeOcrProgressFill');
const fridgeOcrStatus = document.getElementById('fridgeOcrStatus');
const fridgeOcrRunRow = document.getElementById('fridgeOcrRunRow');
const fridgeOcrRunBtn = document.getElementById('fridgeOcrRunBtn');
const ocrDrop = document.getElementById('ocrDrop');
const ocrFileInput = document.getElementById('ocrFileInput');
const ocrPreview = document.getElementById('ocrPreview');
const ocrPreviewImg = document.getElementById('ocrPreviewImg');
const ocrRemoveBtn = document.getElementById('ocrRemoveBtn');
const ocrProgress = document.getElementById('ocrProgress');
const ocrProgressFill = document.getElementById('ocrProgressFill');
const ocrStatus = document.getElementById('ocrStatus');
const ocrRunBtn = document.getElementById('ocrRunBtn');
const confirmOverlay = document.getElementById('confirmOverlay');
const confirmIcon = document.getElementById('confirmIcon');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');
const confirmOkBtn = document.getElementById('confirmOkBtn');

// 新功能 DOM
const calendarBtn = document.getElementById('calendarBtn');
const calendarOverlay = document.getElementById('calendarOverlay');
const calendarCloseBtn = document.getElementById('calendarCloseBtn');
const calGrid = document.getElementById('calGrid');
const calMonthLabel = document.getElementById('calMonthLabel');
const calPrevBtn = document.getElementById('calPrevBtn');
const calNextBtn = document.getElementById('calNextBtn');
const calTodayBtn = document.getElementById('calTodayBtn');
const calPlanBtn = document.getElementById('calPlanBtn');

const profileBtn = document.getElementById('profileBtn');
const profileOverlay = document.getElementById('profileOverlay');
const profileCloseBtn = document.getElementById('profileCloseBtn');
const avatarPreview = document.getElementById('avatarPreview');
const avatarInput = document.getElementById('avatarInput');
const avatarPickBtn = document.getElementById('avatarPickBtn');
const nicknameInput = document.getElementById('nicknameInput');
const heightInput = document.getElementById('heightInput');
const profileSaveBtn = document.getElementById('profileSaveBtn');
const weightInput = document.getElementById('weightInput');
const weightDate = document.getElementById('weightDate');
const weightAddBtn = document.getElementById('weightAddBtn');
const weightChart = document.getElementById('weightChart');
const weightList = document.getElementById('weightList');
const bmiBox = document.getElementById('bmiBox');

const lightBtn = document.getElementById('lightBtn');
const lightOverlay = document.getElementById('lightOverlay');
const lightCloseBtn = document.getElementById('lightCloseBtn');
const lightList = document.getElementById('lightList');

const exerciseBtn = document.getElementById('exerciseBtn');
const exerciseOverlay = document.getElementById('exerciseOverlay');
const exerciseCloseBtn = document.getElementById('exerciseCloseBtn');
const exType = document.getElementById('exType');
const exDuration = document.getElementById('exDuration');
const exAddBtn = document.getElementById('exAddBtn');
const exStats = document.getElementById('exStats');
const exList = document.getElementById('exList');

const shakeBtn = document.getElementById('shakeBtn');
const shakeOverlay = document.getElementById('shakeOverlay');
const shakeResult = document.getElementById('shakeResult');
const shakeCloseBtn = document.getElementById('shakeCloseBtn');
const shakeAgainBtn = document.getElementById('shakeAgainBtn');

const fridgeEditOverlay = document.getElementById('fridgeEditOverlay');
const fridgeEditName = document.getElementById('fridgeEditName');
const fridgeEditDate = document.getElementById('fridgeEditDate');
const fridgeEditCancel = document.getElementById('fridgeEditCancel');
const fridgeEditSave = document.getElementById('fridgeEditSave');

// ============================================
// 工具函数
// ============================================
function showToast(msg, duration = 2000) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => { toastEl.classList.remove('show'); }, duration);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function compressImage(base64, maxSize = 600, quality = 0.6) {
    return new Promise((resolve) => {
        if (!base64) { resolve(null); return; }
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;
            if (width > height) {
                if (width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize; }
            } else {
                if (height > maxSize) { width = Math.round(width * maxSize / height); height = maxSize; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f5ede5';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(null);
        img.src = base64;
    });
}

function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ============================================
// 确认弹层
// ============================================
function showConfirm(options) {
    confirmIcon.textContent = options.icon || '❓';
    confirmTitle.textContent = options.title || '确认操作';
    confirmMessage.textContent = options.message || '';
    confirmOkBtn.textContent = options.okText || '确定';
    confirmOkBtn.style.background = options.okColor || '#c0392b';
    confirmCallback = options.onOk || null;
    confirmOverlay.classList.add('show');
}

function closeConfirm() {
    confirmOverlay.classList.remove('show');
    confirmCallback = null;
}

confirmCancelBtn.addEventListener('click', closeConfirm);
confirmOverlay.addEventListener('click', (e) => { if (e.target === confirmOverlay) closeConfirm(); });
confirmOkBtn.addEventListener('click', () => {
    const cb = confirmCallback;
    closeConfirm();
    if (typeof cb === 'function') cb();
});

// ============================================
// 分类
// ============================================
const CATEGORIES = [
    { key: 'all',    name: '全部', icon: '🍱', cls: '' },
    { key: 'meat',   name: '荤菜', icon: '🥩', cls: 'cat-meat' },
    { key: 'veg',    name: '素菜', icon: '🥬', cls: 'cat-veg' },
    { key: 'soup',   name: '汤羹', icon: '🍲', cls: 'cat-soup' },
    { key: 'staple', name: '主食', icon: '🍚', cls: 'cat-staple' },
    { key: 'cold',   name: '凉菜', icon: '🥗', cls: 'cat-cold' },
    { key: 'dessert',name: '甜品', icon: '🍰', cls: 'cat-dessert' },
    { key: 'other',  name: '其他', icon: '🍽️', cls: 'cat-other' }
];

const PICKABLE_CATEGORIES = CATEGORIES.filter(c => c.key !== 'all');

const KEYWORDS = {
    soup: ['汤','羹','煲','炖汤','排骨汤','鸡汤','鱼汤','紫菜汤','海带汤','冬瓜汤','番茄汤','蘑菇汤','玉米汤','银耳羹','莲子羹','绿豆汤','红豆汤','老火汤','浓汤','清汤','奶油蘑菇汤','罗宋汤','味增汤','蛋花汤','酸辣汤','胡辣汤'],
    dessert: ['蛋糕','饼干','布丁','奶昔','冰淇淋','冰激凌','糖水','甜品','慕斯','派','挞','曲奇','面包','吐司','奶茶','果汁','果酱','果冻','双皮奶','银耳羹','甜点','雪糕','芝士蛋糕','提拉米苏','马卡龙','舒芙蕾','蛋挞','甜甜圈','奶冻'],
    cold: ['凉拌','凉菜','拌菜','沙拉','口水鸡','拍黄瓜','醋泡','卤味','卤菜','皮蛋','凉面','凉皮','夫妻肺片','白切鸡','蒜泥白肉','凉拌菜','手撕鸡','泡椒凤爪'],
    staple: ['米饭','炒饭','盖饭','拌饭','面条','拉面','炒面','拌面','意面','米线','米粉','粥','馒头','包子','饺子','馄饨','饼','馍','花卷','年糕','汤圆','春卷','煎饼','油条','烧麦','小笼包','生煎','锅贴','披萨','汉堡','三明治','寿司','饭团'],
    veg: ['青菜','白菜','菠菜','生菜','油麦菜','空心菜','西兰花','花菜','茄子','土豆','番茄','西红柿','黄瓜','冬瓜','南瓜','丝瓜','苦瓜','豆角','四季豆','豆芽','豆腐','蘑菇','香菇','金针菇','木耳','藕','萝卜','青椒','彩椒','洋葱','韭菜','芹菜','莴笋','山药','玉米','豌豆','荷兰豆','干煸','清炒','蒜蓉','醋溜','地三鲜','手撕包菜','凉拌黄瓜','炒时蔬','上汤娃娃菜','虎皮青椒'],
    meat: ['排骨','鸡翅','鸡腿','鸡肉','鸭肉','鹅肉','牛肉','羊肉','猪肉','五花肉','里脊','肉丝','肉片','肉末','丸子','狮子头','红烧肉','回锅肉','红烧','糖醋','咕咾','宫保','辣子鸡','啤酒鸭','烤鸡','炸鸡','牛排','鱼','虾','蟹','贝','蛤蜊','鱿鱼','培根','火腿','腊肠','香肠','叉烧','卤肉','酱肉','烤肉','煎肉','小炒肉','水煮肉','水煮鱼','酸菜鱼','剁椒鱼头','糖醋里脊','京酱肉丝']
};

function classifyRecipe(recipe) {
    const rawName = (recipe.name || '').trim();
    const name = rawName.toLowerCase();
    const steps = (recipe.steps || '').toLowerCase();
    const text = name + ' ' + steps;
    if (/(汤|羹|煲)$/.test(rawName)) return 'soup';
    if (/(粥|饭|面|粉|饼|包|饺|馄饨|馒头)$/.test(rawName)) return 'staple';
    const priority = ['soup', 'dessert', 'cold', 'staple', 'veg', 'meat'];
    for (const cat of priority) {
        const words = KEYWORDS[cat];
        if (words && words.some(w => text.includes(w))) return cat;
    }
    return 'other';
}

function getCategoryInfo(key) {
    return CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1];
}

// 根据菜名猜 emoji
function guessDishEmoji(name) {
    const n = name || '';
    if (/汤|羹|煲/.test(n)) return '🍲';
    if (/面|粉|米线|拉面/.test(n)) return '🍜';
    if (/炒饭|盖饭|拌饭|米饭/.test(n)) return '🍚';
    if (/沙拉|凉拌|凉菜/.test(n)) return '🥗';
    if (/蛋糕|甜品|布丁|奶昔|冰/.test(n)) return '🍰';
    if (/鸡|鸭|鹅/.test(n)) return '🍗';
    if (/牛|羊|猪|肉|排骨/.test(n)) return '🥩';
    if (/鱼|虾|蟹|海鲜/.test(n)) return '🦐';
    if (/饺|馄饨|包子|馒头/.test(n)) return '🥟';
    if (/饼|披萨/.test(n)) return '🥞';
    if (/菜|蔬/.test(n)) return '🥬';
    if (/蛋/.test(n)) return '🥚';
    if (/豆腐/.test(n)) return '🧈';
    if (/粥/.test(n)) return '🥣';
    if (/茶|奶茶|咖啡/.test(n)) return '🧋';
    return '🍽️';
}

// ============================================
// 本地存储
// ============================================
function loadRecipes() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        recipes = stored ? JSON.parse(stored) : [];
    } catch (e) { recipes = []; }
    recipes = recipes.map(r => ({
        id: r.id || Date.now() + Math.random(),
        name: r.name || '', steps: r.steps || '',
        image: r.image || null,
        category: r.category || classifyRecipe(r),
        categoryManual: r.categoryManual || false
    }));
}

function persistRecipes() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch (e) {
        showToast('存储空间不足，图片可能无法保存', 2500);
    }
}

function loadFridge() {
    try {
        const stored = localStorage.getItem(FRIDGE_KEY);
        fridgeItems = stored ? JSON.parse(stored) : [];
    } catch (e) { fridgeItems = []; }
    fridgeItems = fridgeItems.map(f => ({
        id: f.id || Date.now() + Math.random(),
        name: f.name || '',
        expireDate: f.expireDate || null,
        addedAt: f.addedAt || todayStr()
    })).filter(f => f.name.trim());
}

function persistFridge() {
    try {
        localStorage.setItem(FRIDGE_KEY, JSON.stringify(fridgeItems));
    } catch (e) {
        showToast('存储空间不足', 2000);
    }
}

function loadCalendar() {
    try { cookCalendar = JSON.parse(localStorage.getItem(CALENDAR_KEY) || '[]'); }
    catch (e) { cookCalendar = []; }
}
function persistCalendar() {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(cookCalendar));
}

function loadProfile() {
    try {
        userProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null') || { avatar: null, nickname: '', height: 170 };
    } catch (e) { userProfile = { avatar: null, nickname: '', height: 170 }; }
    try { weightRecords = JSON.parse(localStorage.getItem(WEIGHT_KEY) || '[]'); }
    catch (e) { weightRecords = []; }
}
function persistProfile() { localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile)); }
function persistWeight() { localStorage.setItem(WEIGHT_KEY, JSON.stringify(weightRecords)); }

function loadExercise() {
    try { exerciseRecords = JSON.parse(localStorage.getItem(EXERCISE_KEY) || '[]'); }
    catch (e) { exerciseRecords = []; }
}
function persistExercise() { localStorage.setItem(EXERCISE_KEY, JSON.stringify(exerciseRecords)); }

// ============================================
// 智能提取
// ============================================
function extractFromText(text) {
    if (!text || !text.trim()) return { name: '', steps: '' };
    let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return { name: '', steps: '' };

    let dishName = ''; let dishNameIndex = -1;
    const namePatterns = [
        /^(?:菜名|名称|今天做|做了|分享|推荐|【|#)\s*[:：]?\s*(.+)/i,
        /^(.+?)(?:的做法|做法|教程|食谱|菜谱)/
    ];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.replace(/[\s\p{Emoji}]/gu, '').length < 2) continue;
        for (const pattern of namePatterns) {
            const match = line.match(pattern);
            if (match && match[1]) { dishName = match[1].trim(); dishNameIndex = i; break; }
        }
        if (dishName) break;
        const commonDishWords = ['排骨','鸡翅','牛肉','鱼','虾','豆腐','茄子','土豆','番茄','西红柿','鸡蛋','西兰花','白菜','汤','面','饭','饼','包','糕','粥','锅','丝','片','块','丁','炒','烧','炖','煮','蒸','拌','烤','焖','烩','煎','炸','卤','酱','溜','爆'];
        if (i === 0 && line.length >= 4 && line.length <= 30) {
            const hasDishWord = commonDishWords.some(w => line.includes(w));
            if (hasDishWord || /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/.test(line)) {
                let candidate = line.replace(/^[#【\s🎉🔥✨💕🥘🍲🍜🍚🥗🍰]+\s*/u, '').replace(/\s*[#】\s🎉🔥✨💕🥘🍲🍜🍚🥗🍰]+$/u, '').trim();
                if (candidate.includes('的做法')) candidate = candidate.split('的做法')[0];
                else if (candidate.includes('做法')) candidate = candidate.split('做法')[0];
                if (candidate.length >= 2 && candidate.length <= 25) { dishName = candidate; dishNameIndex = 0; break; }
            }
        }
    }

    if (!dishName) {
        let firstLine = lines[0] || '';
        firstLine = firstLine.replace(/[\p{Emoji}\u200d\uFE0F]/gu, '').trim();
        if (firstLine.length > 25) dishName = firstLine.substring(0, 22) + '...';
        else if (firstLine.length > 0) dishName = firstLine;
        dishNameIndex = 0;
    }

    dishName = dishName.replace(/^[#【\s🎉🔥✨💕🥘🍲🍜🍚🥗🍰]+\s*/u, '').replace(/\s*[#】\s🎉🔥✨💕🥘🍲🍜🍚🥗🍰]+$/u, '').replace(/[：:]\s*$/, '').trim();

    let stepsText = '';
    const stepKeywords = ['步骤','做法','方法','教程','制作','烹饪','操作','做法如下','步骤如下'];
    let stepStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        if (i === dishNameIndex) continue;
        const line = lines[i];
        for (const kw of stepKeywords) {
            if (line.includes(kw)) {
                const cleaned = line.replace(/[步骤做法方法教程制作烹饪操作如下：:]/g, '').trim();
                stepStartIndex = cleaned.length === 0 ? i + 1 : i; break;
            }
        }
        if (stepStartIndex !== -1) break;
    }
    if (stepStartIndex === -1) {
        for (let i = 0; i < lines.length; i++) {
            if (i === dishNameIndex) continue;
            if (/^(?:\d+[\.、．]|①|②|③|④|⑤|⑥|⑦|⑧|⑨|⑩|第[一二三四五六七八九十]+步)/.test(lines[i])) { stepStartIndex = i; break; }
        }
    }
    if (stepStartIndex === -1) stepStartIndex = Math.min(1, lines.length);

    const stepLines = [];
    for (let i = stepStartIndex; i < lines.length; i++) {
        if (i === dishNameIndex) continue;
        let line = lines[i];
        if (/^(?:食材|用料|材料|原料|配料|准备)[：:]/.test(line)) continue;
        line = line.replace(/^[步骤做法方法教程制作烹饪操作如下：:\s]+/i, '').trim();
        if (line.length === 0) continue;
        stepLines.push(line);
    }
    if (stepLines.length > 0) stepsText = stepLines.join('\n');
    else stepsText = lines.filter((_, idx) => idx !== dishNameIndex).join('\n');

    stepsText = stepsText.replace(/^(?:做法|步骤|方法|教程|制作|烹饪|操作)[：:\s]*/i, '').trim();
    if (!stepsText) stepsText = lines.filter((_, idx) => idx !== dishNameIndex).join('\n') || text.trim();
    if (stepsText.length > 2000) stepsText = stepsText.substring(0, 2000) + '...';

    return { name: dishName || '', steps: stepsText || '' };
}

function performExtract() {
    const raw = pasteInput.value.trim();
    if (!raw) { showToast('请先粘贴文案内容', 1500); pasteInput.focus(); return; }
    const result = extractFromText(raw);
    let extracted = false;
    if (result.name) { dishNameInput.value = result.name; extracted = true; }
    if (result.steps) { stepsInput.value = result.steps; extracted = true; }
    if (extracted) {
        showToast('✨ 已提取菜名和步骤', 2000);
        pasteInput.value = '';
        dishNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else showToast('未能识别，请手动填写', 2000);
}

// ============================================
// OCR
// ============================================
function cleanOcrText(text) {
    if (!text) return '';
    return text
        .replace(/[|｜]/g, ' ')
        .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
        .replace(/[Ａ-Ｚａ-ｚ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
        .replace(/。{2,}/g, '。')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

async function getOcrWorker(progressTarget) {
    if (ocrWorker) return ocrWorker;
    showToast('正在加载识别引擎（首次约需10秒）...', 3000);
    ocrWorker = await Tesseract.createWorker('chi_sim+eng', 1, {
        logger: (m) => {
            const isRecipe = progressTarget === 'recipe';
            const progressEl = isRecipe ? ocrProgress : fridgeOcrProgress;
            const fillEl = isRecipe ? ocrProgressFill : fridgeOcrProgressFill;
            const statusEl = isRecipe ? ocrStatus : fridgeOcrStatus;
            if (!progressEl || progressEl.classList.contains('hidden')) return;
            if (m.status === 'recognizing text') {
                const p = Math.round((m.progress || 0) * 100);
                fillEl.style.width = p + '%'; statusEl.textContent = `识别中... ${p}%`;
            } else if (m.status === 'loading language traineddata') {
                fillEl.style.width = '20%'; statusEl.textContent = '正在下载语言包...';
            } else if (m.status === 'initializing api') {
                fillEl.style.width = '40%'; statusEl.textContent = '正在初始化引擎...';
            }
        }
    });
    return ocrWorker;
}

async function recognizeWithRetry(worker, image, retries = 1) {
    for (let i = 0; i <= retries; i++) {
        try {
            const { data: { text } } = await worker.recognize(image);
            if (text && text.trim()) return text;
        } catch (e) { /* 重试 */ }
    }
    return '';
}

ocrDrop.addEventListener('click', () => ocrFileInput.click());
ocrFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('请选择图片文件', 1500); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
        ocrImageBase64 = ev.target.result;
        ocrPreviewImg.src = ocrImageBase64;
        ocrPreview.classList.remove('hidden');
        ocrRunBtn.disabled = false;
        ocrProgress.classList.add('hidden');
        ocrProgressFill.style.width = '0%';
        ocrStatus.textContent = '准备中...';
    };
    reader.readAsDataURL(file);
    ocrFileInput.value = '';
});

ocrRemoveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    ocrImageBase64 = null; ocrPreviewImg.src = '';
    ocrPreview.classList.add('hidden');
    ocrRunBtn.disabled = true;
    ocrProgress.classList.add('hidden');
});

ocrRunBtn.addEventListener('click', async () => {
    if (!ocrImageBase64) { showToast('请先选择图片', 1500); return; }
    ocrRunBtn.disabled = true;
    ocrProgress.classList.remove('hidden');
    ocrProgressFill.style.width = '0%';
    ocrStatus.textContent = '准备中...';
    try {
        const worker = await getOcrWorker('recipe');
        ocrStatus.textContent = '识别中...';
        const compressed = await compressImage(ocrImageBase64, 1200, 0.8);
        const rawText = await recognizeWithRetry(worker, compressed || ocrImageBase64, 1);
        const text = cleanOcrText(rawText);
        if (!text || !text.trim()) {
            showToast('未识别到文字', 2500);
            ocrStatus.textContent = '未识别到文字';
            ocrRunBtn.disabled = false;
            return;
        }
        const result = extractFromText(text);
        if (result.name) dishNameInput.value = result.name;
        if (result.steps) stepsInput.value = result.steps;
        if (result.name || result.steps) { showToast('✨ 识别完成，请核对', 2500); ocrStatus.textContent = '识别完成'; }
        else { stepsInput.value = text.trim(); showToast('已识别文字，请手动整理', 2500); ocrStatus.textContent = '识别完成'; }
    } catch (err) {
        console.error('OCR 失败：', err);
        showToast('识别失败', 2500);
        ocrStatus.textContent = '识别失败';
    } finally { ocrRunBtn.disabled = false; }
});

fridgeOcrPickBtn.addEventListener('click', () => fridgeOcrFileInput.click());
fridgeOcrFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('请选择图片文件', 1500); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
        fridgeOcrImageBase64 = ev.target.result;
        fridgeOcrPreviewImg.src = fridgeOcrImageBase64;
        fridgeOcrPreview.classList.remove('hidden');
        fridgeOcrRunRow.classList.remove('hidden');
        fridgeOcrRunBtn.disabled = false;
        fridgeOcrProgress.classList.add('hidden');
        fridgeOcrProgressFill.style.width = '0%';
        fridgeOcrStatus.textContent = '准备中...';
    };
    reader.readAsDataURL(file);
    fridgeOcrFileInput.value = '';
});

fridgeOcrRemoveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fridgeOcrImageBase64 = null; fridgeOcrPreviewImg.src = '';
    fridgeOcrPreview.classList.add('hidden');
    fridgeOcrRunRow.classList.add('hidden');
    fridgeOcrProgress.classList.add('hidden');
    fridgeOcrRunBtn.disabled = true;
});

fridgeOcrRunBtn.addEventListener('click', async () => {
    if (!fridgeOcrImageBase64) { showToast('请先选择图片', 1500); return; }
    fridgeOcrRunBtn.disabled = true;
    fridgeOcrProgress.classList.remove('hidden');
    fridgeOcrProgressFill.style.width = '0%';
    fridgeOcrStatus.textContent = '准备中...';
    try {
        const worker = await getOcrWorker('fridge');
        fridgeOcrStatus.textContent = '识别中...';
        const compressed = await compressImage(fridgeOcrImageBase64, 1200, 0.8);
        const rawText = await recognizeWithRetry(worker, compressed || fridgeOcrImageBase64, 1);
        const text = cleanOcrText(rawText);
        if (!text || !text.trim()) {
            showToast('未识别到文字', 2500);
            fridgeOcrStatus.textContent = '未识别到文字';
            fridgeOcrRunBtn.disabled = false;
            return;
        }
        const items = parseFridgeText(text);
        if (items.length === 0) {
            showToast('未识别到有效食材', 2500);
            fridgeOcrStatus.textContent = '未识别到有效食材';
            fridgeOcrRunBtn.disabled = false;
            return;
        }
        let added = 0;
        items.forEach(name => {
            const exists = fridgeItems.some(f => f.name === name);
            if (!exists) {
                fridgeItems.push({ id: Date.now() + Math.random(), name, expireDate: null, addedAt: todayStr() });
                added++;
            }
        });
        persistFridge();
        renderFridge();
        if (added === 0) showToast(`识别到 ${items.length} 项，但都已在冰箱里`, 2500);
        else showToast(`✅ 识别到 ${items.length} 项，新增 ${added} 项`, 2500);
        fridgeOcrImageBase64 = null; fridgeOcrPreviewImg.src = '';
        fridgeOcrPreview.classList.add('hidden');
        fridgeOcrRunRow.classList.add('hidden');
        fridgeOcrProgress.classList.add('hidden');
        fridgeOcrRunBtn.disabled = true;
    } catch (err) {
        console.error('冰箱 OCR 失败：', err);
        showToast('识别失败', 2500);
        fridgeOcrStatus.textContent = '识别失败';
        fridgeOcrRunBtn.disabled = false;
    }
});

function parseFridgeText(text) {
    if (!text) return [];
    let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/[，、；;]/g, '\n').replace(/\s{2,}/g, '\n').replace(/\n+/g, '\n');
    const lines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const items = []; const seen = new Set();
    lines.forEach(line => {
        let cleaned = line.replace(/^[\d]+[\.、．)\]\s]+/, '').replace(/^[-—–·•*]+\s*/, '').replace(/[。！!？?]+$/, '').trim();
        if (/^(食材|用料|材料|原料|配料|准备|清单|购物|小票|超市|合计|总计|金额|单价|数量|日期|时间|欢迎|谢谢)[：:]?/.test(cleaned)) return;
        if (cleaned.length < 2 || cleaned.length > 12) return;
        if (/^[\d\.\-\+\s]+$/.test(cleaned)) return;
        if (seen.has(cleaned)) return;
        seen.add(cleaned); items.push(cleaned);
    });
    return items;
}

// ============================================
// Tab 切换
// ============================================
document.querySelectorAll('.smart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        document.querySelectorAll('.smart-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.smart-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('panel-' + target).classList.add('active');
    });
});

// ============================================
// 表单
// ============================================
function openFormSheet() {
    formOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}
function closeFormSheet() {
    formOverlay.classList.remove('show');
    document.body.style.overflow = '';
}

function resetFormToAddMode() {
    editingId = null; currentImageBase64 = null;
    previewImg.src = ''; previewImg.classList.add('hidden');
    previewPlaceholder.style.display = 'flex';
    dishNameInput.value = '';
    stepsInput.value = '';
    pasteInput.value = '';
    ocrImageBase64 = null; ocrPreviewImg.src = '';
    ocrPreview.classList.add('hidden');
    ocrProgress.classList.add('hidden');
    ocrRunBtn.disabled = true;
    ocrProgressFill.style.width = '0%';
    document.querySelectorAll('.smart-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.smart-panel').forEach(p => p.classList.remove('active'));
    document.querySelector('.smart-tab[data-tab="paste"]').classList.add('active');
    document.getElementById('panel-paste').classList.add('active');
    formTitle.textContent = '添加新菜';
    formIcon.textContent = '📝';
    saveBtn.textContent = '💾 保存这道菜';
    saveBtn.classList.remove('update-mode');
    editBanner.classList.add('hidden');
}

function enterEditMode(recipe) {
    editingId = recipe.id;
    dishNameInput.value = recipe.name || '';
    stepsInput.value = recipe.steps || '';
    if (recipe.image) {
        currentImageBase64 = recipe.image;
        previewImg.src = recipe.image;
        previewImg.classList.remove('hidden');
        previewPlaceholder.style.display = 'none';
    } else {
        currentImageBase64 = null;
        previewImg.src = '';
        previewImg.classList.add('hidden');
        previewPlaceholder.style.display = 'flex';
    }
    formTitle.textContent = '编辑菜谱';
    formIcon.textContent = '✏️';
    saveBtn.textContent = '📌 更新这道菜';
    saveBtn.classList.add('update-mode');
    editBanner.classList.remove('hidden');
    openFormSheet();
}

function cancelEdit() {
    resetFormToAddMode();
    showToast('已取消编辑', 1200);
}

// ============================================
// 保存 / 更新菜谱
// ============================================
async function saveOrUpdateRecipe() {
    const name = dishNameInput.value.trim();
    const steps = stepsInput.value.trim();
    if (!name) { showToast('请填写菜名', 1500); dishNameInput.focus(); return; }
    if (!steps) { showToast('请填写关键步骤', 1500); stepsInput.focus(); return; }

    saveBtn.disabled = true;
    saveBtn.textContent = '保存中...';

    try {
        let compressedImage = null;
        if (currentImageBase64) {
            compressedImage = await compressImage(currentImageBase64, 600, 0.6);
        }

        if (editingId) {
            const index = recipes.findIndex(r => r.id === editingId);
            if (index !== -1) {
                const old = recipes[index];
                const updated = { ...old, name, steps, image: compressedImage };
                if (!old.categoryManual) updated.category = classifyRecipe(updated);
                recipes[index] = updated;
                persistRecipes();
                renderAll();
                showToast('✅ 菜谱已更新', 1500);
            }
            resetFormToAddMode();
            closeFormSheet();
        } else {
            const newRecipe = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                name, steps, image: compressedImage, categoryManual: false
            };
            newRecipe.category = classifyRecipe(newRecipe);
            recipes.unshift(newRecipe);
            persistRecipes();
            currentPage = 1;
            renderAll();
            showToast('✅ 菜谱已保存', 1500);
            resetFormToAddMode();
            closeFormSheet();
        }
    } catch (err) {
        console.error('保存失败：', err);
        showToast('保存失败：' + (err.message || '请重试'), 2500);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = editingId ? '📌 更新这道菜' : '💾 保存这道菜';
    }
}

// ============================================
// 删除
// ============================================
function deleteRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    showConfirm({
        icon: '🗑️', title: '删除菜谱',
        message: `确定要删除「${recipe.name}」吗？`,
        okText: '删除', okColor: '#c0392b',
        onOk: () => {
            if (editingId === id) { resetFormToAddMode(); closeFormSheet(); }
            recipes = recipes.filter(r => r.id !== id);
            selectedIds.delete(id);
            persistRecipes();
            renderAll();
            showToast('已删除', 1200);
        }
    });
}

function batchDelete() {
    if (selectedIds.size === 0) return;
    const n = selectedIds.size;
    showConfirm({
        icon: '🗑️', title: '批量删除',
        message: `确定要删除选中的 ${n} 道菜吗？`,
        okText: `删除 ${n} 道`, okColor: '#c0392b',
        onOk: () => {
            if (editingId && selectedIds.has(editingId)) { resetFormToAddMode(); closeFormSheet(); }
            recipes = recipes.filter(r => !selectedIds.has(r.id));
            selectedIds.clear();
            persistRecipes();
            updateBatchUI();
            renderAll();
            showToast(`已删除 ${n} 道菜`, 1500);
        }
    });
}

// ============================================
// 分类纠正
// ============================================
function openCategoryPicker(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    pickerRecipeId = recipeId;
    const currentCat = recipe.category || 'other';
    pickerSubtitle.innerHTML = `为 <strong>${escapeHtml(recipe.name)}</strong> 选择正确的分类：`;
    let html = '';
    PICKABLE_CATEGORIES.forEach(cat => {
        const isCurrent = cat.key === currentCat;
        html += `
            <div class="picker-option ${isCurrent ? 'current' : ''}" data-category="${cat.key}">
                <span class="opt-icon">${cat.icon}</span>
                <span>${cat.name}</span>
                ${isCurrent ? '<span class="opt-check">✓</span>' : ''}
            </div>
        `;
    });
    pickerGrid.innerHTML = html;
    pickerGrid.querySelectorAll('.picker-option').forEach(opt => {
        opt.addEventListener('click', () => {
            applyManualCategory(pickerRecipeId, opt.getAttribute('data-category'));
            closeCategoryPicker();
        });
    });
    categoryPickerOverlay.classList.add('show');
}

function closeCategoryPicker() {
    categoryPickerOverlay.classList.remove('show');
    pickerRecipeId = null;
}

function applyManualCategory(recipeId, newCat) {
    const index = recipes.findIndex(r => r.id === recipeId);
    if (index === -1) return;
    if (recipes[index].category === newCat) { showToast('分类未改变', 1000); return; }
    recipes[index].category = newCat;
    recipes[index].categoryManual = true;
    persistRecipes();
    renderAll();
    showToast(`✅ 已改为「${getCategoryInfo(newCat).name}」`, 1500);
}

// ============================================
// 做菜日历
// ============================================
function markCookedToday(recipe) {
    const today = todayStr();
    const exists = cookCalendar.some(c => c.date === today && c.recipeId === recipe.id && !c.planned);
    if (exists) { showToast('今天已经记录过这道菜啦', 1500); return; }
    cookCalendar.push({
        id: Date.now() + Math.random(),
        date: today,
        recipeId: recipe.id,
        recipeName: recipe.name,
        note: '',
        planned: false
    });
    persistCalendar();
    showToast(`✅ 已记录「${recipe.name}」`, 1500);
}

function renderCalendar() {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const today = todayStr();

    calMonthLabel.textContent = `${calendarYear} 年 ${calendarMonth + 1} 月`;

    let html = '';
    ['日','一','二','三','四','五','六'].forEach(d => {
        html += `<div class="cal-head">${d}</div>`;
    });
    for (let i = 0; i < firstDay; i++) html += `<div class="cal-cell empty"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${calendarYear}-${String(calendarMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const dishes = cookCalendar.filter(c => c.date === dateStr);
        const isToday = dateStr === today;
        html += `
            <div class="cal-cell ${isToday ? 'today' : ''} ${dishes.length ? 'has-dish' : ''}" data-date="${dateStr}">
                <span>${d}</span>
                ${dishes.length ? `<span class="cal-dot">${dishes.length}</span>` : ''}
            </div>`;
    }
    calGrid.innerHTML = html;

    calGrid.querySelectorAll('.cal-cell[data-date]').forEach(cell => {
        cell.addEventListener('click', () => showDayDishes(cell.getAttribute('data-date')));
    });
}

function showDayDishes(date) {
    const dishes = cookCalendar.filter(c => c.date === date);
    if (dishes.length === 0) {
        showConfirm({
            icon: '📅', title: date,
            message: '这天还没有记录，要为这天排菜吗？',
            okText: '去排菜', okColor: '#3d6a9e',
            onOk: () => openPlanDialog(date)
        });
        return;
    }
    const msg = dishes.map(d => `· ${d.recipeName}${d.planned ? '（计划）' : ''}`).join('\n');
    showConfirm({
        icon: '📅', title: date,
        message: `这天做了：\n${msg}`,
        okText: '关闭', okColor: '#3d6a9e',
        onOk: () => {}
    });
}

function openPlanDialog(date) {
    if (recipes.length === 0) { showToast('还没有菜谱可以排', 1500); return; }
    // 简化版：随机挑一道给这天排上，并提示
    const pick = recipes[Math.floor(Math.random() * recipes.length)];
    const exists = cookCalendar.some(c => c.date === date && c.recipeId === pick.id);
    if (exists) { showToast('这天已经排过这道菜了', 1500); return; }
    cookCalendar.push({
        id: Date.now() + Math.random(),
        date,
        recipeId: pick.id,
        recipeName: pick.name,
        note: '',
        planned: true
    });
    persistCalendar();
    renderCalendar();
    showToast(`✅ 已为 ${date} 排上「${pick.name}」`, 1800);
}

// ============================================
// 个人主页
// ============================================
function renderProfile() {
    // 头像
    if (userProfile.avatar) {
        avatarPreview.innerHTML = `<img src="${userProfile.avatar}" alt="头像">`;
    } else {
        avatarPreview.textContent = '👤';
    }
    nicknameInput.value = userProfile.nickname || '';
    heightInput.value = userProfile.height || '';
    renderWeight();
}

function renderWeight() {
    // BMI
    const h = parseFloat(userProfile.height);
    const latest = weightRecords.length ? weightRecords[weightRecords.length - 1].weight : null;
    if (h && latest) {
        const bmi = latest / ((h / 100) ** 2);
        let label = '';
        if (bmi < 18.5) label = '偏瘦';
        else if (bmi < 24) label = '正常';
        else if (bmi < 28) label = '偏胖';
        else label = '肥胖';
        bmiBox.classList.remove('hidden');
        bmiBox.textContent = `当前 BMI：${bmi.toFixed(1)}（${label}）`;
    } else {
        bmiBox.classList.add('hidden');
    }

    // 折线图
    if (weightRecords.length < 2) {
        weightChart.innerHTML = '<div style="text-align:center;color:#b8a18c;font-size:13px;padding:20px 0;">至少记录两次体重才能画曲线哦</div>';
    } else {
        const w = 300, h = 130, pad = 20;
        const weights = weightRecords.map(r => r.weight);
        const min = Math.min(...weights), max = Math.max(...weights);
        const range = max - min || 1;
        const points = weightRecords.map((r, i) => {
            const x = pad + (i / (weightRecords.length - 1)) * (w - pad * 2);
            const y = h - pad - ((r.weight - min) / range) * (h - pad * 2);
            return `${x},${y}`;
        }).join(' ');
        weightChart.innerHTML = `
            <svg viewBox="0 0 ${w} ${h}" class="weight-chart">
                <polyline points="${points}" fill="none" stroke="#c0392b" stroke-width="2"/>
                ${weightRecords.map((r, i) => {
                    const x = pad + (i / (weightRecords.length - 1)) * (w - pad * 2);
                    const y = h - pad - ((r.weight - min) / range) * (h - pad * 2);
                    return `<circle cx="${x}" cy="${y}" r="3" fill="#c0392b"/>`;
                }).join('')}
            </svg>
            <div class="weight-range">最低 ${min}kg / 最高 ${max}kg</div>
        `;
    }

    // 列表
    const list = weightRecords.slice().reverse();
    if (list.length === 0) {
        weightList.innerHTML = '<div style="text-align:center;color:#b8a18c;font-size:13px;padding:10px 0;">还没有体重记录</div>';
    } else {
        weightList.innerHTML = list.map(r => `
            <div class="weight-item">
                <span>${r.date} · <strong>${r.weight} kg</strong></span>
                <button class="w-del" data-id="${r.id}" title="删除">🗑️</button>
            </div>
        `).join('');
        weightList.querySelectorAll('.w-del').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.getAttribute('data-id'));
                weightRecords = weightRecords.filter(r => r.id !== id);
                persistWeight();
                renderWeight();
                showToast('已删除', 1000);
            });
        });
    }
}

function addWeightRecord() {
    const w = parseFloat(weightInput.value);
    if (!w || w < 20 || w > 300) { showToast('请输入合理体重（kg）', 1500); return; }
    const d = weightDate.value || todayStr();
    weightRecords.push({ id: Date.now() + Math.random(), date: d, weight: w });
    weightRecords.sort((a, b) => a.date.localeCompare(b.date));
    persistWeight();
    weightInput.value = '';
    weightDate.value = '';
    renderWeight();
    showToast('✅ 体重已记录', 1500);
}

// ============================================
// 轻食搭配
// ============================================
const LIGHT_KEYWORDS = ['沙拉','鸡胸','西兰花','水煮','蒸','凉拌','酸奶','燕麦','牛油果','番茄','黄瓜','紫薯','玉米','鸡蛋','豆腐','低脂','少油'];

function isLightRecipe(recipe) {
    const text = (recipe.name + ' ' + recipe.steps).toLowerCase();
    return LIGHT_KEYWORDS.some(k => text.includes(k));
}

function renderLightMatch() {
    const fridgeNames = fridgeItems.map(f => f.name);
    const lightRecipes = recipes.filter(isLightRecipe);
    const scored = lightRecipes.map(r => {
        const text = r.name + ' ' + r.steps;
        const hit = fridgeNames.filter(n => text.includes(n)).length;
        return { recipe: r, hit };
    }).sort((a, b) => b.hit - a.hit);

    if (scored.length === 0) {
        lightList.innerHTML = '<div style="text-align:center;color:#b8a18c;font-size:13px;padding:20px 0;">还没有轻食类菜谱，先添加几道吧～</div>';
        return;
    }
    lightList.innerHTML = scored.slice(0, 8).map(({ recipe, hit }) => `
        <div class="light-card">
            <div class="light-name">${guessDishEmoji(recipe.name)} ${escapeHtml(recipe.name)}</div>
            <div class="light-hit">${hit > 0 ? `✅ 冰箱可匹配 ${hit} 种食材` : '🧊 冰箱暂无匹配食材'}</div>
        </div>
    `).join('');
}

// ============================================
// 运动打卡
// ============================================
function addExercise() {
    const type = exType.value.trim();
    const d = parseInt(exDuration.value, 10);
    if (!type) { showToast('请填写运动类型', 1200); exType.focus(); return; }
    if (!d || d <= 0) { showToast('请填写运动时长（分钟）', 1200); exDuration.focus(); return; }
    exerciseRecords.push({
        id: Date.now() + Math.random(),
        date: todayStr(),
        type, duration: d
    });
    persistExercise();
    exType.value = '';
    exDuration.value = '';
    renderExercise();
    showToast(`✅ 已打卡 ${type} ${d} 分钟`, 1500);
}

function renderExercise() {
    // 统计：最近 7 天
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const min = exerciseRecords.filter(e => e.date === ds).reduce((s, e) => s + e.duration, 0);
        days.push({ date: ds, min });
    }
    const todayMin = days[days.length - 1].min;
    const maxMin = Math.max(...days.map(d => d.min), 1);

    exStats.innerHTML = `
        <div class="exercise-today">今日运动：<strong>${todayMin}</strong> 分钟</div>
        <div class="exercise-bars">
            ${days.map(d => `
                <div class="ex-bar-wrap">
                    <div class="ex-bar" style="height:${(d.min / maxMin) * 100}%"></div>
                    <div class="ex-label">${d.date.slice(5)}</div>
                </div>
            `).join('')}
        </div>
    `;

    // 列表
    const list = exerciseRecords.slice().reverse();
    if (list.length === 0) {
        exList.innerHTML = '<div style="text-align:center;color:#b8a18c;font-size:13px;padding:10px 0;">还没有运动记录</div>';
    } else {
        exList.innerHTML = list.map(e => `
            <div class="exercise-item">
                <span>${e.date} · ${escapeHtml(e.type)} · <strong>${e.duration} 分钟</strong></span>
                <button class="ex-del" data-id="${e.id}" title="删除">🗑️</button>
            </div>
        `).join('');
        exList.querySelectorAll('.ex-del').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.getAttribute('data-id'));
                exerciseRecords = exerciseRecords.filter(r => r.id !== id);
                persistExercise();
                renderExercise();
                showToast('已删除', 1000);
            });
        });
    }
}

// ============================================
// 摇一摇
// ============================================
function randomPickRecipe() {
    const visible = getVisibleRecipes();
    const pool = visible.length ? visible : recipes;
    if (pool.length === 0) { showToast('没有可选的菜谱', 1500); return; }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    shakeResult.textContent = `${guessDishEmoji(pick.name)} ${pick.name}\n\n${(pick.steps || '').slice(0, 80)}...`;
    shakeOverlay.classList.add('show');
}

// ============================================
// 分享
// ============================================
async function generateShareLink(mode, withImages) {
    let shareList = [];
    if (mode === 'all') shareList = recipes.slice();
    else if (mode === 'filtered') shareList = getVisibleRecipes().slice();
    else if (mode === 'selected') shareList = recipes.filter(r => selectedIds.has(r.id));

    if (shareList.length === 0) {
        showToast('没有可分享的菜谱', 1500);
        return { link: null, isFileProtocol: false };
    }

    const compressedList = [];
    for (const r of shareList) {
        let img = null;
        if (withImages && r.image) {
            img = await compressImage(r.image, 200, 0.4);
        }
        compressedList.push({ n: r.name, s: r.steps, i: img, c: r.category || 'other' });
    }

    const json = JSON.stringify(compressedList);
    let encoded = '';
    try { encoded = btoa(unescape(encodeURIComponent(json))); }
    catch (e) { encoded = encodeURIComponent(json); }

    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}#share=${encodeURIComponent(encoded)}`;
    const isFileProtocol = window.location.protocol === 'file:';
    return { link, isFileProtocol, dataLength: encoded.length };
}

async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (e) {}
    try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        return true;
    } catch (e) { return false; }
}

function openSharePanel() {
    shareSelectedCount.textContent = selectedIds.size;
    shareLinkBox.classList.add('hidden');
    shareLinkBox.textContent = '';
    shareLinkInfo.classList.add('hidden');
    shareConfirmBtn.classList.add('hidden');
    shareCancelBtn.textContent = '取消';
    shareOverlay.classList.add('show');
}

function closeSharePanel() {
    shareOverlay.classList.remove('show');
}

let shareLinkCache = null;

shareOptions.querySelectorAll('.share-option').forEach(opt => {
    opt.addEventListener('click', async () => {
        const mode = opt.getAttribute('data-mode');
        if (mode === 'selected' && selectedIds.size === 0) {
            showToast('请先在批量管理中勾选要分享的菜', 2000);
            return;
        }
        const withImages = shareWithImages.checked;
        showToast('正在生成链接...', 1000);
        const result = await generateShareLink(mode, withImages);
        if (!result.link) return;
        shareLinkCache = result.link;
        shareLinkBox.textContent = result.link;
        shareLinkBox.classList.remove('hidden');
        shareConfirmBtn.classList.remove('hidden');
        shareCancelBtn.textContent = '关闭';
        shareLinkBox.scrollTop = 0;
        shareLinkInfo.classList.remove('hidden');
        if (result.isFileProtocol) {
            shareLinkInfo.classList.add('warning');
            shareLinkInfo.innerHTML = '⚠️ <strong>当前是本地文件模式</strong>';
        } else if (result.dataLength > 4000) {
            shareLinkInfo.classList.add('warning');
            shareLinkInfo.innerHTML = '⚠️ <strong>链接较长</strong><br>建议关闭「带上菜品图片」重新生成。';
        } else {
            shareLinkInfo.classList.remove('warning');
            shareLinkInfo.innerHTML = '✅ 链接已生成，复制后发给舍友。';
        }
    });
});

shareConfirmBtn.addEventListener('click', async () => {
    if (!shareLinkCache) return;
    const ok = await copyToClipboard(shareLinkCache);
    if (ok) showToast('✅ 链接已复制', 2500);
    else showToast('复制失败，请长按链接手动复制', 2500);
});

// ============================================
// 舍友点菜模式
// ============================================
function enterGuestMode(shareDataStr) {
    let list = [];
    try {
        let json = '';
        try { json = decodeURIComponent(escape(atob(decodeURIComponent(shareDataStr)))); }
        catch (e) { json = decodeURIComponent(shareDataStr); }
        const arr = JSON.parse(json);
        list = arr.map((item, idx) => ({
            id: 'g_' + idx,
            name: item.n || '', steps: item.s || '',
            image: item.i || null, category: item.c || 'other'
        }));
    } catch (e) {
        console.warn('解析分享数据失败', e);
        showToast('分享链接无效或已损坏', 2500);
        isGuestMode = false;
        fabBtn.classList.remove('hidden');
        document.getElementById('ownerView').classList.remove('hidden');
        document.getElementById('guestView').classList.add('hidden');
        guestCartBar.classList.add('hidden');
        return;
    }

    fabBtn.classList.add('hidden');
    document.getElementById('ownerView').classList.add('hidden');
    document.getElementById('guestView').classList.remove('hidden');
    guestCartBar.classList.remove('hidden');
    guestTitle.textContent = '🍽️ 有人喊你点菜啦';
    guestDesc.textContent = `共 ${list.length} 道菜，勾选想吃的，生成清单发回给TA`;

    let html = '';
    list.forEach(recipe => {
        const imageHtml = recipe.image
            ? `<img src="${recipe.image}" alt="${escapeHtml(recipe.name)}" loading="lazy">`
            : `<span>${guessDishEmoji(recipe.name)}</span>`;
        const catInfo = getCategoryInfo(recipe.category);
        html += `
            <div class="guest-recipe-item" data-id="${recipe.id}">
                <div class="select-checkbox">
                    <input type="checkbox" data-id="${recipe.id}">
                </div>
                <div class="recipe-thumb">${imageHtml}</div>
                <div class="recipe-info">
                    <div class="recipe-name">
                        ${escapeHtml(recipe.name)}
                        <span class="category-tag ${catInfo.cls}" style="cursor:default;">${catInfo.icon} ${catInfo.name}</span>
                    </div>
                    <div class="recipe-steps">${escapeHtml(recipe.steps)}</div>
                </div>
            </div>
        `;
    });
    guestRecipeList.innerHTML = html;

    guestRecipeList.querySelectorAll('.guest-recipe-item').forEach(item => {
        const id = item.getAttribute('data-id');
        const cb = item.querySelector('input[type="checkbox"]');
        const toggle = () => {
            if (guestSelectedIds.has(id)) {
                guestSelectedIds.delete(id);
                item.classList.remove('picked');
                cb.checked = false;
            } else {
                guestSelectedIds.add(id);
                item.classList.add('picked');
                cb.checked = true;
            }
            updateGuestCart();
        };
        item.addEventListener('click', (e) => { if (e.target === cb) return; toggle(); });
        cb.addEventListener('change', (e) => {
            e.stopPropagation();
            if (cb.checked) { guestSelectedIds.add(id); item.classList.add('picked'); }
            else { guestSelectedIds.delete(id); item.classList.remove('picked'); }
            updateGuestCart();
        });
    });

    guestList = list;
    updateGuestCart();
}

function updateGuestCart() {
    guestCartCount.textContent = guestSelectedIds.size;
    guestSubmitBtn.disabled = guestSelectedIds.size === 0;
}

guestSubmitBtn.addEventListener('click', () => {
    const picked = guestList.filter(r => guestSelectedIds.has(r.id));
    if (picked.length === 0) return;
    let text = '🍽️ 我想吃这些菜：\n\n';
    picked.forEach((r, i) => { text += `${i + 1}. ${r.name}\n`; });
    text += `\n—— 共 ${picked.length} 道 ——`;
    copyToClipboard(text).then(ok => {
        if (ok) showToast('✅ 点菜清单已复制', 2500);
        else alert(text);
    });
});

// ============================================
// 渲染
// ============================================
function renderCategoryBar() {
    const countMap = {};
    CATEGORIES.forEach(c => { countMap[c.key] = 0; });
    recipes.forEach(r => {
        const key = r.category || 'other';
        countMap[key] = (countMap[key] || 0) + 1;
    });
    countMap.all = recipes.length;

    let html = '';
    CATEGORIES.forEach(cat => {
        const isActive = activeCategory === cat.key;
        const count = countMap[cat.key] || 0;
        html += `
            <div class="category-chip ${isActive ? 'active' : ''}" data-category="${cat.key}">
                <span>${cat.icon}</span>
                <span>${cat.name}</span>
                <span class="chip-count">${count}</span>
            </div>
        `;
    });
    categoryBar.innerHTML = html;
    categoryBar.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            activeCategory = chip.getAttribute('data-category');
            currentPage = 1;
            renderAll();
        });
    });
}

function updateBatchUI() {
    if (manageMode) {
        selectAllBtn.classList.remove('hidden');
        batchDelBtn.classList.remove('hidden');
        selectedCount.textContent = selectedIds.size;
        batchDelBtn.disabled = selectedIds.size === 0;
        const visibleRecipes = getVisibleRecipes();
        if (visibleRecipes.length > 0 && visibleRecipes.every(r => selectedIds.has(r.id))) {
            selectAllBtn.textContent = '取消全选';
        } else {
            selectAllBtn.textContent = '全选';
        }
    } else {
        selectAllBtn.classList.add('hidden');
        batchDelBtn.classList.add('hidden');
        selectedIds.clear();
    }
}

function getVisibleRecipes() {
    if (activeCategory === 'all') return recipes;
    return recipes.filter(r => (r.category || 'other') === activeCategory);
}

function renderRecipeList() {
    const visible = getVisibleRecipes();

    if (visible.length === 0) {
        recipeListEl.innerHTML = `
            <div class="empty-message">
                <span>🥣</span>
                <div>${activeCategory === 'all' ? '还没有菜谱' : '这个分类下还没有菜谱'}</div>
                <div class="empty-sub">${activeCategory === 'all' ? '点右下角「＋」添加第一道菜吧～' : '换个分类看看'}</div>
            </div>
        `;
        return;
    }

    const totalPages = Math.ceil(visible.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = visible.slice(start, start + PAGE_SIZE);

    let html = '';
    pageItems.forEach(recipe => {
        const imageHtml = recipe.image
            ? `<img src="${recipe.image}" alt="${escapeHtml(recipe.name)}" loading="lazy">`
            : `<span class="dish-emoji">${guessDishEmoji(recipe.name)}</span>`;
        const catInfo = getCategoryInfo(recipe.category || 'other');
        const catTag = `<span class="category-tag ${catInfo.cls}" data-cat-id="${recipe.id}" title="点击修改分类">${catInfo.icon} ${catInfo.name}</span>`;
        const isSelected = selectedIds.has(recipe.id);
        const checkboxHtml = manageMode
            ? `<div class="select-checkbox"><input type="checkbox" data-id="${recipe.id}" ${isSelected ? 'checked' : ''}></div>`
            : '';
        const actionButtons = manageMode ? '' : `
            <div class="action-buttons">
                <button class="cook-btn" data-id="${recipe.id}" title="记录今天做了">🍳</button>
                <button class="edit-btn" data-id="${recipe.id}" title="编辑">✏️</button>
                <button class="delete-btn" data-id="${recipe.id}" title="删除">🗑️</button>
            </div>`;

        html += `
            <div class="recipe-item ${isSelected ? 'selected' : ''}" data-id="${recipe.id}">
                ${checkboxHtml}
                <div class="recipe-thumb">${imageHtml}</div>
                <div class="recipe-info">
                    <div class="recipe-name">
                        ${escapeHtml(recipe.name)}
                        ${catTag}
                        ${actionButtons}
                    </div>
                    <div class="recipe-steps">${escapeHtml(recipe.steps)}</div>
                </div>
            </div>
        `;
    });

    if (totalPages > 1) {
        html += `
            <div class="pagination">
                <button class="page-btn" id="prevPageBtn" ${currentPage <= 1 ? 'disabled' : ''}>← 上一页</button>
                <span class="page-info">${currentPage} / ${totalPages}</span>
                <button class="page-btn" id="nextPageBtn" ${currentPage >= totalPages ? 'disabled' : ''}>下一页 →</button>
            </div>
        `;
    }

    recipeListEl.innerHTML = html;

    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) { currentPage--; renderRecipeList(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) { currentPage++; renderRecipeList(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        });
    }

    document.querySelectorAll('.cook-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = Number(btn.getAttribute('data-id'));
            const recipe = recipes.find(r => r.id === id);
            if (recipe) markCookedToday(recipe);
        });
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = Number(btn.getAttribute('data-id'));
            const recipe = recipes.find(r => r.id === id);
            if (recipe) enterEditMode(recipe);
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = Number(btn.getAttribute('data-id'));
            deleteRecipe(id);
        });
    });
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = Number(tag.getAttribute('data-cat-id'));
            openCategoryPicker(id);
        });
    });
    document.querySelectorAll('.select-checkbox input').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const id = Number(cb.getAttribute('data-id'));
            if (cb.checked) selectedIds.add(id);
            else selectedIds.delete(id);
            const card = cb.closest('.recipe-item');
            if (card) card.classList.toggle('selected', cb.checked);
            updateBatchUI();
        });
    });
}

function renderAll() {
    recipeCountEl.textContent = recipes.length + ' 道';
    renderCategoryBar();
    renderRecipeList();
    updateBatchUI();
}

// ============================================
// 冰箱渲染（含保质期）
// ============================================
function guessEmoji(name) {
    const n = name;
    if (/蛋/.test(n)) return '🥚';
    if (/奶|芝士|黄油|酸奶/.test(n)) return '🥛';
    if (/肉|排骨|鸡|鸭|牛|羊|猪|培根|香肠|火腿/.test(n)) return '🥩';
    if (/鱼|虾|蟹|贝|鱿鱼|蛤蜊/.test(n)) return '🐟';
    if (/菜|菠菜|生菜|白菜|西兰花|芹菜|韭菜|黄瓜|番茄|西红柿|土豆|萝卜|茄子|青椒|彩椒|洋葱|蘑菇|香菇|木耳|藕|山药|玉米|豆/.test(n)) return '🥬';
    if (/苹果|香蕉|橙|橘|葡萄|草莓|蓝莓|柠檬|西瓜|梨|桃|芒果|水果/.test(n)) return '🍎';
    if (/米|面|粉|馒头|面包|饺子|馄饨|包子|饼/.test(n)) return '🍚';
    if (/油|盐|糖|酱|醋|料酒|生抽|老抽|蚝油|味精|鸡精|胡椒|花椒|八角|桂皮|香叶|蒜|姜|葱|辣椒/.test(n)) return '🧂';
    if (/水|饮料|果汁|可乐|雪碧|茶|咖啡/.test(n)) return '🥤';
    return '🧊';
}

function getExpireStatus(item) {
    if (!item.expireDate) return { level: 'none', text: '' };
    const today = new Date(); today.setHours(0,0,0,0);
    const exp = new Date(item.expireDate + 'T00:00:00');
    const diff = Math.round((exp - today) / 86400000);
    if (diff < 0)  return { level: 'expired', text: `已过期 ${-diff} 天` };
    if (diff === 0) return { level: 'today',   text: '今天到期' };
    if (diff <= 3)  return { level: 'soon',    text: `${diff} 天后过期` };
    return { level: 'fresh', text: `${diff} 天后过期` };
}

function renderFridge() {
    const count = fridgeItems.length;
    fridgeCount.textContent = `共 ${count} 种食材`;

    const expired = fridgeItems.filter(f => getExpireStatus(f).level === 'expired');
    const soon = fridgeItems.filter(f => ['today','soon'].includes(getExpireStatus(f).level));
    let alertHtml = '';
    if (expired.length) alertHtml += `<div class="fridge-alert expired">⚠️ ${expired.length} 种食材已过期，建议尽快清理</div>`;
    if (soon.length)   alertHtml += `<div class="fridge-alert soon">⏰ ${soon.length} 种食材即将过期</div>`;

    if (count === 0) {
        fridgeList.innerHTML = alertHtml + `
            <div class="fridge-empty">
                🧊 冰箱空空如也<br>
                手动输入或拍照识别添加食材吧～
            </div>`;
        return;
    }

    const sorted = [...fridgeItems].sort((a, b) => {
        const order = { expired: 0, today: 1, soon: 2, fresh: 3, none: 4 };
        return order[getExpireStatus(a).level] - order[getExpireStatus(b).level];
    });

    let html = alertHtml;
    sorted.forEach(item => {
        const st = getExpireStatus(item);
        const expireHtml = item.expireDate
            ? `<span class="fridge-expire ${st.level}">${st.text}</span>`
            : `<span class="fridge-expire none">未设保质期</span>`;
        html += `
            <div class="fridge-item ${st.level}" data-id="${item.id}">
                <span class="fridge-emoji">${guessEmoji(item.name)}</span>
                <div class="fridge-main">
                    <span class="fridge-name">${escapeHtml(item.name)}</span>
                    ${expireHtml}
                </div>
                <button class="fridge-edit" data-id="${item.id}" title="编辑">✏️</button>
                <button class="fridge-del" data-id="${item.id}" title="删除">🗑️</button>
            </div>`;
    });
    fridgeList.innerHTML = html;

    fridgeList.querySelectorAll('.fridge-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = Number(btn.getAttribute('data-id'));
            const item = fridgeItems.find(f => f.id === id);
            if (item) openFridgeEdit(item);
        });
    });

    fridgeList.querySelectorAll('.fridge-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = Number(btn.getAttribute('data-id'));
            const item = fridgeItems.find(f => f.id === id);
            if (!item) return;
            showConfirm({
                icon: '🗑️', title: '移除食材',
                message: `确定要从冰箱移除「${item.name}」吗？`,
                okText: '移除', okColor: '#c0392b',
                onOk: () => {
                    fridgeItems = fridgeItems.filter(f => f.id !== id);
                    persistFridge();
                    renderFridge();
                    showToast(`已移除「${item.name}」`, 1200);
                }
            });
        });
    });
}

function openFridgeEdit(item) {
    fridgeEditingId = item.id;
    fridgeEditName.value = item.name;
    fridgeEditDate.value = item.expireDate || '';
    fridgeEditOverlay.classList.add('show');
}

function closeFridgeEdit() {
    fridgeEditOverlay.classList.remove('show');
    fridgeEditingId = null;
}

fridgeEditCancel.addEventListener('click', closeFridgeEdit);
fridgeEditOverlay.addEventListener('click', (e) => { if (e.target === fridgeEditOverlay) closeFridgeEdit(); });
fridgeEditSave.addEventListener('click', () => {
    if (!fridgeEditingId) return;
    const name = fridgeEditName.value.trim();
    if (!name) { showToast('名称不能为空', 1200); return; }
    const date = fridgeEditDate.value || null;
    const idx = fridgeItems.findIndex(f => f.id === fridgeEditingId);
    if (idx !== -1) {
        fridgeItems[idx] = { ...fridgeItems[idx], name, expireDate: date };
        persistFridge();
        renderFridge();
        showToast('✅ 已更新', 1200);
    }
    closeFridgeEdit();
});

function addFridgeItem(name, expireDate) {
    const trimmed = (name || '').trim();
    if (!trimmed) return false;
    if (fridgeItems.some(f => f.name === trimmed)) {
        showToast(`「${trimmed}」已经在冰箱里了`, 1500);
        return false;
    }
    fridgeItems.push({
        id: Date.now() + Math.random(),
        name: trimmed,
        expireDate: expireDate || null,
        addedAt: todayStr()
    });
    persistFridge();
    renderFridge();
    return true;
}

fridgeAddBtn.addEventListener('click', () => {
    const val = fridgeInput.value;
    if (!val.trim()) { showToast('请输入食材名称', 1200); fridgeInput.focus(); return; }
    const parts = val.replace(/[，、；;]/g, ',').split(',').map(s => s.trim()).filter(s => s.length > 0);
    let added = 0;
    parts.forEach(p => {
        let name = p, expireDate = null;
        if (p.includes('|')) {
            const [n, d] = p.split('|').map(s => s.trim());
            name = n;
            if (/^\d{4}-\d{2}-\d{2}$/.test(d)) expireDate = d;
        }
        if (addFridgeItem(name, expireDate)) added++;
    });
    if (added > 0) {
        fridgeInput.value = '';
        showToast(`已添加 ${added} 种食材`, 1500);
    }
});

fridgeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); fridgeAddBtn.click(); }
});

fridgeClearBtn.addEventListener('click', () => {
    if (fridgeItems.length === 0) { showToast('冰箱已经是空的', 1200); return; }
    showConfirm({
        icon: '🧊', title: '清空冰箱',
        message: `确定要清空冰箱里的 ${fridgeItems.length} 种食材吗？`,
        okText: '清空', okColor: '#c0392b',
        onOk: () => {
            fridgeItems = [];
            persistFridge();
            renderFridge();
            showToast('冰箱已清空', 1200);
        }
    });
});

fridgeBtn.addEventListener('click', () => {
    renderFridge();
    fridgeInput.value = '';
    fridgeOcrImageBase64 = null;
    fridgeOcrPreviewImg.src = '';
    fridgeOcrPreview.classList.add('hidden');
    fridgeOcrRunRow.classList.add('hidden');
    fridgeOcrProgress.classList.add('hidden');
    fridgeOcrFileInput.value = '';
    fridgeOcrRunBtn.disabled = true;
    closeSharePanel();
    fridgeOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
});

fridgeCloseBtn.addEventListener('click', () => {
    fridgeOverlay.classList.remove('show');
    document.body.style.overflow = '';
});

fridgeOverlay.addEventListener('click', (e) => {
    if (e.target === fridgeOverlay) {
        fridgeOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }
});

// ============================================
// 导出 / 导入
// ============================================
function exportBackup() {
    if (recipes.length === 0 && fridgeItems.length === 0) {
        showToast('还没有数据可以导出', 1500);
        return;
    }
    const backup = {
        version: 2,
        exportAt: new Date().toISOString(),
        recipes: recipes,
        fridgeItems: fridgeItems,
        cookCalendar: cookCalendar,
        userProfile: userProfile,
        weightRecords: weightRecords,
        exerciseRecords: exerciseRecords
    };
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const filename = `今天吃啥-备份-${dateStr}.json`;
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    showToast(`✅ 已导出 ${recipes.length} 道菜谱`, 2200);
}

function importBackup(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            let importedRecipes = [];
            let importedFridge = [];
            if (Array.isArray(data)) importedRecipes = data;
            else if (data && Array.isArray(data.recipes)) {
                importedRecipes = data.recipes;
                importedFridge = Array.isArray(data.fridgeItems) ? data.fridgeItems : [];
            } else { showToast('文件格式不对', 2000); return; }

            if (importedRecipes.length === 0 && importedFridge.length === 0) {
                showToast('文件里没有可导入的数据', 2000);
                return;
            }

            showConfirm({
                icon: '📥', title: '导入备份',
                message: `将导入 ${importedRecipes.length} 道菜谱、${importedFridge.length} 种食材。\n\n会替换当前所有数据，确定吗？`,
                okText: '确认导入', okColor: '#3d6a9e',
                onOk: () => {
                    recipes = importedRecipes.map(r => ({
                        id: r.id || Date.now() + Math.random(),
                        name: r.name || '', steps: r.steps || '',
                        image: r.image || null,
                        category: r.category || classifyRecipe(r),
                        categoryManual: r.categoryManual || false
                    }));
                    if (importedFridge.length > 0) {
                        fridgeItems = importedFridge.map(item => ({
                            id: item.id || Date.now() + Math.random(),
                            name: item.name || '',
                            expireDate: item.expireDate || null,
                            addedAt: item.addedAt || todayStr()
                        })).filter(item => item.name.trim());
                    }
                    // 新数据
                    if (Array.isArray(data.cookCalendar)) cookCalendar = data.cookCalendar;
                    if (data.userProfile) userProfile = data.userProfile;
                    if (Array.isArray(data.weightRecords)) weightRecords = data.weightRecords;
                    if (Array.isArray(data.exerciseRecords)) exerciseRecords = data.exerciseRecords;

                    persistRecipes();
                    persistFridge();
                    persistCalendar();
                    persistProfile();
                    persistWeight();
                    persistExercise();
                    currentPage = 1;
                    renderAll();
                    renderFridge();
                    showToast(`✅ 已导入 ${recipes.length} 道菜谱`, 2000);
                }
            });
        } catch (err) {
            console.error('导入失败：', err);
            showToast('文件解析失败', 2000);
        }
    };
    reader.readAsText(file);
}

// ============================================
// 事件绑定
// ============================================
headerAddBtn.addEventListener('click', () => { resetFormToAddMode(); openFormSheet(); });
fabBtn.addEventListener('click', () => { resetFormToAddMode(); openFormSheet(); });
sheetCloseBtn.addEventListener('click', () => { resetFormToAddMode(); closeFormSheet(); });
formOverlay.addEventListener('click', (e) => {
    if (e.target === formOverlay) { resetFormToAddMode(); closeFormSheet(); }
});

extractBtn.addEventListener('click', performExtract);
clearPasteBtn.addEventListener('click', () => { pasteInput.value = ''; pasteInput.focus(); });
pasteInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); performExtract(); }
});

cancelEditBtn.addEventListener('click', cancelEdit);
saveBtn.addEventListener('click', saveOrUpdateRecipe);
dishNameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') e.preventDefault(); });

imageInput.addEventListener('change', function(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('请选择图片文件', 1500); return; }
    const reader = new FileReader();
    reader.onload = function(ev) {
        currentImageBase64 = ev.target.result;
        previewImg.src = currentImageBase64;
        previewImg.classList.remove('hidden');
        previewPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
    imageInput.value = '';
});

previewContainer.addEventListener('click', () => imageInput.click());
previewContainer.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    if (currentImageBase64) {
        currentImageBase64 = null;
        previewImg.src = '';
        previewImg.classList.add('hidden');
        previewPlaceholder.style.display = 'flex';
        showToast('已移除图片', 1000);
    }
});

pickerCancelBtn.addEventListener('click', closeCategoryPicker);
categoryPickerOverlay.addEventListener('click', (e) => {
    if (e.target === categoryPickerOverlay) closeCategoryPicker();
});

manageModeToggle.addEventListener('change', (e) => {
    manageMode = e.target.checked;
    if (!manageMode) selectedIds.clear();
    updateBatchUI();
    renderRecipeList();
});

selectAllBtn.addEventListener('click', () => {
    const visible = getVisibleRecipes();
    const allSelected = visible.length > 0 && visible.every(r => selectedIds.has(r.id));
    if (allSelected) visible.forEach(r => selectedIds.delete(r.id));
    else visible.forEach(r => selectedIds.add(r.id));
    updateBatchUI();
    renderRecipeList();
});

batchDelBtn.addEventListener('click', batchDelete);
shareBtn.addEventListener('click', openSharePanel);
shareCancelBtn.addEventListener('click', closeSharePanel);
shareOverlay.addEventListener('click', (e) => {
    if (e.target === shareOverlay) closeSharePanel();
});

exportBtn.addEventListener('click', exportBackup);
importBtn.addEventListener('click', () => importFileInput.click());
importFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    importBackup(file);
    importFileInput.value = '';
});

// ===== 新功能事件绑定 =====
calendarBtn.addEventListener('click', () => {
    calendarYear = new Date().getFullYear();
    calendarMonth = new Date().getMonth();
    renderCalendar();
    calendarOverlay.classList.add('show');
});
calendarCloseBtn.addEventListener('click', () => calendarOverlay.classList.remove('show'));
calendarOverlay.addEventListener('click', (e) => { if (e.target === calendarOverlay) calendarOverlay.classList.remove('show'); });
calPrevBtn.addEventListener('click', () => {
    calendarMonth--;
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
    renderCalendar();
});
calNextBtn.addEventListener('click', () => {
    calendarMonth++;
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    renderCalendar();
});
calTodayBtn.addEventListener('click', () => {
    calendarYear = new Date().getFullYear();
    calendarMonth = new Date().getMonth();
    renderCalendar();
});
calPlanBtn.addEventListener('click', () => openPlanDialog(todayStr()));

profileBtn.addEventListener('click', () => {
    renderProfile();
    profileOverlay.classList.add('show');
});
profileCloseBtn.addEventListener('click', () => profileOverlay.classList.remove('show'));
profileOverlay.addEventListener('click', (e) => { if (e.target === profileOverlay) profileOverlay.classList.remove('show'); });
avatarPickBtn.addEventListener('click', () => avatarInput.click());
avatarInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
        const compressed = await compressImage(ev.target.result, 200, 0.7);
        userProfile.avatar = compressed;
        persistProfile();
        renderProfile();
        showToast('✅ 头像已更新', 1500);
    };
    reader.readAsDataURL(file);
    avatarInput.value = '';
});
profileSaveBtn.addEventListener('click', () => {
    userProfile.nickname = nicknameInput.value.trim();
    const h = parseFloat(heightInput.value);
    if (h && h >= 50 && h <= 250) userProfile.height = h;
    persistProfile();
    renderProfile();
    showToast('✅ 资料已保存', 1500);
});
weightAddBtn.addEventListener('click', addWeightRecord);
weightDate.value = todayStr();

lightBtn.addEventListener('click', () => {
    renderLightMatch();
    lightOverlay.classList.add('show');
});
lightCloseBtn.addEventListener('click', () => lightOverlay.classList.remove('show'));
lightOverlay.addEventListener('click', (e) => { if (e.target === lightOverlay) lightOverlay.classList.remove('show'); });

exerciseBtn.addEventListener('click', () => {
    renderExercise();
    exerciseOverlay.classList.add('show');
});
exerciseCloseBtn.addEventListener('click', () => exerciseOverlay.classList.remove('show'));
exerciseOverlay.addEventListener('click', (e) => { if (e.target === exerciseOverlay) exerciseOverlay.classList.remove('show'); });
exAddBtn.addEventListener('click', addExercise);

shakeBtn.addEventListener('click', randomPickRecipe);
shakeCloseBtn.addEventListener('click', () => shakeOverlay.classList.remove('show'));
shakeAgainBtn.addEventListener('click', randomPickRecipe);
shakeOverlay.addEventListener('click', (e) => { if (e.target === shakeOverlay) shakeOverlay.classList.remove('show'); });

// ============================================
// 初始化
// ============================================
function init() {
    const urlParams = new URLSearchParams(window.location.search);
    let shareDataStr = urlParams.get('share');
    if (!shareDataStr) {
        const hash = window.location.hash || '';
        const hashMatch = hash.match(/[#&]share=([^&]*)/);
        if (hashMatch) shareDataStr = decodeURIComponent(hashMatch[1]);
    }

    if (shareDataStr) {
        isGuestMode = true;
        enterGuestMode(shareDataStr);
        return;
    }

    loadRecipes();
    loadFridge();
    loadCalendar();
    loadProfile();
    loadExercise();
    renderAll();
    renderFridge();
}

init();
