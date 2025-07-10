let selectedAlgorithm = "", selectedDesign = "", inputArray = [], stopSorting = false, speed = 300;

function updateSpeed(value) {
  const level = parseInt(value);
  speed = 1100 - level * 100;
  const label = document.getElementById("speedLabel");
  if (level <= 3) label.innerText = "느림";
  else if (level <= 7) label.innerText = "중간";
  else label.innerText = "빠름";
}

function CSort(algorithm) {
  selectedAlgorithm = algorithm;
  document.getElementById("step1").style.display = "none";
  document.getElementById("step2").style.display = "block";
}

function SortD(design) {
  selectedDesign = design;
  document.getElementById("step2").style.display = "none";
  document.getElementById("step3").style.display = "block";
}

function back(step) {
  stopSorting = true;
  ["step1", "step2", "step3", "step4"].forEach(id => document.getElementById(id).style.display = "none");
  document.getElementById(step).style.display = "block";
  const msg = document.getElementById("complete");
  if (msg) msg.remove();
}

function resetToStart() {
  inputArray = [];

  const inputField = document.querySelector("#step3 input");
  if (inputField) inputField.value = "";

  const visual = document.getElementById("visual");
  if (visual) visual.innerHTML = "";

  const msg = document.getElementById("complete");
  if (msg) msg.remove();

  back("step1");
}


function ranarr() {
  const arr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)+1);
  document.querySelector("#step3 input").value = arr.join(" ");
}

function done() {
  const input = document.querySelector("#step3 input").value.trim();
  if (!input) { alert("배열을 입력하거나 자동 생성하세요!"); return; }
  inputArray = input.split(" ").map(Number);
  if (inputArray.some(isNaN)) { alert("숫자만 입력하세요."); return; }
  startSort();
}

async function startSort() {
  stopSorting = false;
  document.getElementById('sort').innerText = selectedAlgorithm;
  const arr = [...inputArray];
  document.getElementById("step3").style.display = "none";
  document.getElementById("step4").style.display = "block";
  drawBars(arr);
  const funcs = {
    bubble: visualizeBubbleSort,
    selection: visualizeSelectionSort,
    insertion: visualizeInsertionSort,
    merge: visualizeMergeSort,
    quick: visualizeQuickSort,
    heap: visualizeHeapSort,
    power: visualizePowerSort
  };
  const fn = funcs[selectedAlgorithm];
  if (!fn) { alert("정렬 방식이 선택되지 않았습니다."); return; }
  await fn(arr);
  if (!stopSorting) {
    drawBars(arr);
    const msg = document.createElement("div");
    msg.id = "complete";
    msg.innerText = "정렬이 완료되었습니다!";
    msg.style.color = "#ffffff";
    msg.style.fontSize = "24px";
    msg.style.marginTop = "20px";
    document.getElementById("step4").appendChild(msg);
  }
}

function drawBars(array, parentIdx = -1, swapIndices = [], compareIndices = [], isParentPurple = false) {
  const visual = document.getElementById("visual");
  visual.innerHTML = "";
  const max = Math.max(...array);
  if (!Array.isArray(swapIndices)) swapIndices = swapIndices === -1 ? [] : [swapIndices];
  if (!Array.isArray(compareIndices)) compareIndices = compareIndices === -1 ? [] : [compareIndices];
  array.forEach((val, idx) => {
    const el = document.createElement("div");
    if (selectedDesign === "box") {
      el.classList.add("box");
      el.innerText = val;
      el.style.height = "40px";
      el.style.width = "40px";
    } else {
      el.style.height = `${(val / max) * 100}%`;
      el.style.width = "20px";
    }
    el.style.margin = "5px";
    if (swapIndices.includes(idx)) {
      el.style.background = "#4db6ac";
      el.classList.add("lift");
    } else if (idx === parentIdx && isParentPurple) {
      el.style.background = "#3f51b5";
      el.classList.add("lift");
    } else if (idx === parentIdx || compareIndices.includes(idx)) {
      el.style.background = "#ffd54f";
    } else {
      el.style.background = "white";
    }
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    visual.appendChild(el);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function animateCompareNodes(compareIndices, skipDrop = false, highlightColor = "#ffd54f") {
  if (!compareIndices || compareIndices.length === 0) return;
  await sleep(100);
  const bars = document.getElementById("visual").children;
  compareIndices.forEach(idx => {
    if (bars[idx]) {
      bars[idx].style.transition = "transform 0.3s ease, background-color 0.3s ease";
      bars[idx].style.background = highlightColor;
      bars[idx].style.transform = "translateY(-20px)";
    }
  });
  await sleep(speed);
  if (!skipDrop) {
    compareIndices.forEach(idx => {
      if (bars[idx]) {
        bars[idx].style.transform = "translateY(0)";
      }
    });
    await sleep(speed);
    compareIndices.forEach(idx => {
      if (bars[idx]) {
        bars[idx].style.transition = "";
        bars[idx].style.background = "white";
      }
    });
  }
}


async function swapWithAnimation(arr, idx1, idx2) {
  const bars = document.getElementById("visual").children;
  drawBars(arr, -1, [idx1, idx2]);
  await sleep(speed);
  const rect1 = bars[idx1].getBoundingClientRect();
  const rect2 = bars[idx2].getBoundingClientRect();
  const distance = rect2.left - rect1.left;
  bars[idx1].style.transition = "transform 0.3s ease";
  bars[idx2].style.transition = "transform 0.3s ease";
  bars[idx1].style.transform = `translateX(${distance}px) translateY(-20px)`;
  bars[idx2].style.transform = `translateX(${-distance}px) translateY(-20px)`;
  await sleep(speed);
  [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
  bars[idx1].style.transition = "none";
  bars[idx2].style.transition = "none";
  bars[idx1].style.transform = "";
  bars[idx2].style.transform = "";
  drawBars(arr, -1, [idx1, idx2]);
  await sleep(50);
  const newBars = document.getElementById("visual").children;
  newBars[idx1].classList.add("drop");
  newBars[idx2].classList.add("drop");
  newBars[idx1].style.transition = "transform 0.3s ease";
  newBars[idx2].style.transition = "transform 0.3s ease";
  await sleep(20);
  newBars[idx1].classList.remove("lift");
  newBars[idx2].classList.remove("lift");
  await sleep(300);
  newBars[idx1].classList.remove("drop");
  newBars[idx2].classList.remove("drop");
  newBars[idx1].style.transition = "";
  newBars[idx2].style.transition = "";
}

async function visualizeBubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (stopSorting) return;
      drawBars(arr, -1, [], [j, j + 1]);
      await animateCompareNodes([j, j + 1]);
      if (arr[j] > arr[j + 1]) {
        await animateCompareNodes([j, j + 1], true, "#4db6ac");
        await swapWithAnimation(arr, j, j + 1);
      }
    }
  }
}

async function visualizeSelectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (stopSorting) return;
      drawBars(arr, -1, [], [i, minIdx, j]);
      await animateCompareNodes([i, minIdx, j]);
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        drawBars(arr, -1, [], [i, minIdx, j]);
        await animateCompareNodes([i, minIdx, j]);
      }
    }
    if (minIdx !== i) {
      await animateCompareNodes([i, minIdx], true, "#4db6ac");
      await swapWithAnimation(arr, i, minIdx);
    }
  }
}

async function visualizeInsertionSort(arr) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0 && arr[j - 1] > arr[j]) {
      if (stopSorting) return;
      drawBars(arr, -1, [], [j - 1, j]);
      await animateCompareNodes([j - 1, j]);
      await animateCompareNodes([j - 1, j], true, "#4db6ac");
      await swapWithAnimation(arr, j - 1, j);
      j--;
    }
    drawBars(arr);
    await sleep(speed);
  }
}

async function visualizeMergeSort(arr) {
  async function mergeSortHelper(start, end) {
    if (stopSorting) return;
    if (end - start <= 1) return;
    const mid = Math.floor((start + end) / 2);
    await mergeSortHelper(start, mid);
    await mergeSortHelper(mid, end);
    await merge(start, mid, end);
  }
  async function merge(start, mid, end) {
    let i = start, j = mid;
    while (i < j && j < end && !stopSorting) {
      drawBars(arr, -1, [], [i, j]);
      await animateCompareNodes([i, j]);
      if (arr[i] <= arr[j]) {
        i++;
      } else {
        let value = arr[j];
        for (let k = j; k > i; k--) {
          drawBars(arr, -1, [], [k, k - 1]);
          await sleep(20);
          await animateCompareNodes([k, k - 1], true, "#4db6ac");
          await swapWithAnimation(arr, k, k - 1);
          if (stopSorting) return;
        }
        arr[i] = value;
        i++;
        j++;
        mid++;
      }
    }
  }
  await mergeSortHelper(0, arr.length);
}

async function visualizeQuickSort(arr) {
  async function quickSortHelper(low, high) {
    if (stopSorting) return;
    if (low >= high) return;
    const p = await partition(low, high);
    await quickSortHelper(low, p - 1);
    await quickSortHelper(p + 1, high);
  }
  async function partition(low, high) {
    let pivot = arr[high];
    let i = low;
    for (let j = low; j < high; j++) {
      if (stopSorting) return;
      drawBars(arr, high, [i], [j], true);
      await animateCompareNodes([j]);
      if (arr[j] < pivot) {
        await animateCompareNodes([i, j], true, "#4db6ac");
        await swapWithAnimation(arr, i, j);
        i++;
      }
    }
    await animateCompareNodes([i, high], true, "#4db6ac");
    await swapWithAnimation(arr, i, high);
    return i;
  }
  await quickSortHelper(0, arr.length - 1);
}

async function visualizeHeapSort(arr) {
  const n = arr.length;
  async function heapify(n, i) {
    if (stopSorting) return;
    let largest = i,
      l = 2 * i + 1,
      r = 2 * i + 2;
    if (l < n) {
      drawBars(arr, i, [], [l], true);
      await animateCompareNodes([l]);
      if (arr[l] > arr[largest]) {
        largest = l;
      }
    }
    if (r < n) {
      drawBars(arr, i, [], [r], true);
      await animateCompareNodes([r]);
      if (arr[r] > arr[largest]) {
        largest = r;
      }
    }
    if (largest !== i) {
      drawBars(arr, i, [largest], [], true);
      await sleep(speed);
      await animateCompareNodes([i, largest], true, "#4db6ac");
      await swapWithAnimation(arr, i, largest);
      await heapify(n, largest);
    } else {
      drawBars(arr);
      await sleep(speed);
    }
  }
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    if (stopSorting) return;
    drawBars(arr, 0, [i], [], true);
    await sleep(speed);
    await animateCompareNodes([0, i], true, "#4db6ac");
    await swapWithAnimation(arr, 0, i);
    await heapify(i, 0);
  }
}

function detectRuns(arr) {
  const runs = [];
  let start = 0;
  for (let i = 1; i <= arr.length; i++) {
    if (i === arr.length || arr[i] < arr[i - 1]) {
      runs.push({ start: start, end: i });
      start = i;
    }
  }
  return runs;
}

async function visualizePowerSort(arr) {
  let runs = detectRuns(arr);
  while (runs.length > 1 && !stopSorting) {
    const run1 = runs.shift();
    const run2 = runs.shift();
    await mergeRuns(arr, run1, run2);
    runs.unshift({ start: run1.start, end: run2.end });
  }
}

async function mergeRuns(arr, run1, run2) {
  let i = run1.start;
  let j = run2.start;
  while (i < j && j < run2.end && !stopSorting) {
    drawBars(arr, -1, [], [i, j]);
    await animateCompareNodes([i, j]);
    if (arr[i] <= arr[j]) {
      i++;
    } else {
      let value = arr[j];
      for (let k = j; k > i; k--) {
        drawBars(arr, -1, [], [k, k - 1]);
        await sleep(20);
        await animateCompareNodes([k, k - 1], true, "#4db6ac");
        await swapWithAnimation(arr, k, k - 1);
      }
      arr[i] = value;
      drawBars(arr);
      await sleep(speed);
      i++;
      j++;
    }
  }
}
