(function () {
  "use strict";

  var STORAGE_KEY = "simulador-exam-state-v1";

  var state = {
    examTitle: "Simulador de examen",
    examVersion: "1",
    settings: {},
    questions: [],
    answers: {},
    completed: false,
    introDismissed: false
  };

  var elements = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheElements();
    bindEvents();

    try {
      var source = await loadExamSource();
      hydrateState(source);
      render();
    } catch (error) {
      showError(error instanceof Error ? error.message : "No fue posible cargar el examen.");
    }
  }

  function cacheElements() {
    elements.examTitle = document.getElementById("exam-title");
    elements.examSubtitle = document.getElementById("exam-subtitle");
    elements.questionProgress = document.getElementById("question-progress");
    elements.progressPercent = document.getElementById("progress-percent");
    elements.correctCount = document.getElementById("correct-count");
    elements.incorrectCount = document.getElementById("incorrect-count");
    elements.progressBar = document.getElementById("progress-bar");
    elements.sectionBadge = document.getElementById("section-badge");
    elements.topicBadge = document.getElementById("topic-badge");
    elements.statusBanner = document.getElementById("status-banner");
    elements.loadingState = document.getElementById("loading-state");
    elements.errorState = document.getElementById("error-state");
    elements.questionView = document.getElementById("question-view");
    elements.questionsList = document.getElementById("questions-list");
    elements.summaryView = document.getElementById("summary-view");
    elements.downloadGuideBtn = document.getElementById("download-guide-btn");
    elements.footerNote = document.getElementById("footer-note");
    elements.restartBtn = document.getElementById("restart-btn");
    elements.introModal = document.getElementById("intro-modal");
    elements.introCloseBtn = document.getElementById("intro-close-btn");
    elements.introStartBtn = document.getElementById("intro-start-btn");
    elements.summaryMessage = document.getElementById("summary-message");
    elements.summaryScore = document.getElementById("summary-score");
    elements.summaryCorrect = document.getElementById("summary-correct");
    elements.summaryIncorrect = document.getElementById("summary-incorrect");
    elements.summaryPercent = document.getElementById("summary-percent");
  }

  function bindEvents() {
    elements.restartBtn.addEventListener("click", restartExam);
    elements.downloadGuideBtn.addEventListener("click", downloadStudyGuide);
    elements.introCloseBtn.addEventListener("click", dismissIntroModal);
    elements.introStartBtn.addEventListener("click", dismissIntroModal);
    elements.introModal.addEventListener("click", function (event) {
      if (event.target === elements.introModal) {
        dismissIntroModal();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !elements.introModal.classList.contains("hidden")) {
        dismissIntroModal();
      }
    });
  }

  async function loadExamSource() {
    var remoteData = await tryFetchExamJson();
    if (remoteData) {
      return remoteData;
    }

    var embeddedData = getEmbeddedExamData();
    if (embeddedData) {
      return embeddedData;
    }

    throw new Error("No se pudo cargar exam.json ni el respaldo local data.js. Verifica que ambos archivos existan junto a index.html.");
  }

  async function tryFetchExamJson() {
    try {
      var response = await fetch("exam.json", { cache: "no-store" });
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      return null;
    }
  }

  function getEmbeddedExamData() {
    if (window.EXAM_DATA && typeof window.EXAM_DATA === "object") {
      return window.EXAM_DATA;
    }

    return null;
  }

  function hydrateState(source) {
    var examRoot = getExamRoot(source);
    var normalizedQuestions = normalizeQuestions(examRoot);

    if (!normalizedQuestions.length) {
      throw new Error("No se encontraron preguntas vÃ¡lidas en el archivo del examen.");
    }

    state.examTitle = readFirstDefined(examRoot, ["title", "name"], "Simulador de examen");
    state.examVersion = String(readFirstDefined(examRoot, ["version"], "1"));
    state.settings = normalizeSettings(readFirstDefined(examRoot, ["settings"], {}));
    state.questions = applyOrdering(normalizedQuestions, state.settings, state.examTitle + "::" + state.examVersion);

    restoreSavedState();
    state.introDismissed = getAnsweredCount() > 0 || state.completed;
  }

  function getExamRoot(source) {
    if (source && typeof source === "object") {
      if (source.exam && typeof source.exam === "object") {
        return source.exam;
      }

      return source;
    }

    return {};
  }

  function normalizeSettings(settings) {
    return {
      shuffleQuestions: Boolean(readFirstDefined(settings, ["shuffle_questions", "shuffleQuestions"], false)),
      shuffleOptions: Boolean(readFirstDefined(settings, ["shuffle_options", "shuffleOptions"], false))
    };
  }

  function normalizeQuestions(examRoot) {
    // Acepta tanto preguntas planas como estructuras por secciones y temas.
    var flatQuestions = readFirstDefined(examRoot, ["questions", "items"], []);
    if (Array.isArray(flatQuestions) && flatQuestions.length) {
      return flatQuestions
        .map(function (question, index) {
          return normalizeQuestion(question, {
            sectionTitle: readFirstDefined(question, ["section", "section_title", "sectionTitle"], "General"),
            topicTitle: readFirstDefined(question, ["topic", "topic_title", "topicTitle"], "Sin tema"),
            index: index
          });
        })
        .filter(Boolean);
    }

    var sections = readFirstDefined(examRoot, ["sections", "categories"], []);
    if (!Array.isArray(sections)) {
      return [];
    }

    var normalized = [];
    sections.forEach(function (section, sectionIndex) {
      var sectionTitle = readFirstDefined(section, ["title", "name", "label"], "SecciÃ³n " + (sectionIndex + 1));
      var topics = readFirstDefined(section, ["topics", "items"], []);

      if (Array.isArray(topics) && topics.length) {
        topics.forEach(function (topic, topicIndex) {
          var topicTitle = readFirstDefined(topic, ["title", "name", "label"], readFirstDefined(topic, ["topic"], "Tema " + (topicIndex + 1)));
          var questions = readFirstDefined(topic, ["questions", "items"], []);
          if (!Array.isArray(questions)) {
            return;
          }

          questions.forEach(function (question, questionIndex) {
            var normalizedQuestion = normalizeQuestion(question, {
              sectionTitle: sectionTitle,
              topicTitle: topicTitle,
              index: normalized.length || questionIndex
            });
            if (normalizedQuestion) {
              normalized.push(normalizedQuestion);
            }
          });
        });
      }

      var sectionQuestions = readFirstDefined(section, ["questions"], []);
      if (Array.isArray(sectionQuestions) && sectionQuestions.length) {
        sectionQuestions.forEach(function (question, questionIndex) {
          var normalizedQuestion = normalizeQuestion(question, {
            sectionTitle: sectionTitle,
            topicTitle: readFirstDefined(question, ["topic", "topic_title", "topicTitle"], "Sin tema"),
            index: normalized.length || questionIndex
          });
          if (normalizedQuestion) {
            normalized.push(normalizedQuestion);
          }
        });
      }
    });

    return normalized;
  }

  function normalizeQuestion(question, context) {
    if (!question || typeof question !== "object") {
      return null;
    }

    var text = readFirstDefined(question, ["text", "question", "prompt", "title"], "");
    if (!text) {
      return null;
    }

    var rawCorrect = readFirstDefined(question, ["correct_option", "correctOption", "correct_answer", "correctAnswer", "answer", "correct"], null);
    var rawIncorrect = readFirstDefined(question, ["incorrect_options", "incorrectOptions", "wrong_options", "wrongOptions"], []);
    var rawOptions = readFirstDefined(question, ["options", "choices", "answers", "alternatives"], []);

    var options = normalizeOptions(rawOptions, rawCorrect, rawIncorrect);
    if (!options.length) {
      return null;
    }

    var correctOption = resolveCorrectOption(rawCorrect, options);
    if (!correctOption) {
      correctOption = options[0];
    }

    var feedback = readFirstDefined(question, ["feedback"], {});
    var feedbackCorrect = readFirstDefined(question, ["feedback_correct", "feedbackCorrect"], null) ||
      readFirstDefined(feedback, ["correct", "positive"], "Respuesta correcta. Buen trabajo.");
    var feedbackIncorrect = readFirstDefined(question, ["feedback_incorrect", "feedbackIncorrect"], null) ||
      readFirstDefined(feedback, ["incorrect", "negative"], "Respuesta incorrecta. Revisa la explicaciÃ³n y sigue practicando.");

    return {
      id: String(readFirstDefined(question, ["id"], context.index + 1)),
      section: readFirstDefined(question, ["section", "section_title", "sectionTitle"], context.sectionTitle),
      topic: readFirstDefined(question, ["topic", "topic_title", "topicTitle"], context.topicTitle),
      questionStatus: readFirstDefined(question, ["question_status", "questionStatus"], ""),
      text: String(text).trim(),
      options: options,
      correctOption: correctOption,
      feedbackCorrect: String(feedbackCorrect).trim(),
      feedbackIncorrect: String(feedbackIncorrect).trim()
    };
  }

  function normalizeOptions(rawOptions, rawCorrect, rawIncorrect) {
    var collected = [];

    if (Array.isArray(rawOptions)) {
      rawOptions.forEach(function (option) {
        var normalized = normalizeOptionValue(option);
        if (normalized) {
          collected.push(normalized);
        }
      });
    }

    var correctOption = normalizeOptionValue(rawCorrect);
    if (correctOption) {
      collected.push(correctOption);
    }

    if (Array.isArray(rawIncorrect)) {
      rawIncorrect.forEach(function (option) {
        var normalized = normalizeOptionValue(option);
        if (normalized) {
          collected.push(normalized);
        }
      });
    }

    return uniqueStrings(collected);
  }

  function normalizeOptionValue(option) {
    if (typeof option === "string" || typeof option === "number") {
      return String(option).trim();
    }

    if (option && typeof option === "object") {
      return String(readFirstDefined(option, ["text", "label", "value", "option"], "")).trim();
    }

    return "";
  }

  function resolveCorrectOption(rawCorrect, options) {
    if (typeof rawCorrect === "number" && options[rawCorrect]) {
      return options[rawCorrect];
    }

    var candidate = normalizeOptionValue(rawCorrect);
    if (!candidate) {
      return "";
    }

    var exactMatch = options.find(function (option) {
      return option === candidate;
    });

    if (exactMatch) {
      return exactMatch;
    }

    var looseMatch = options.find(function (option) {
      return normalizeText(option) === normalizeText(candidate);
    });

    return looseMatch || "";
  }

  function applyOrdering(questions, settings, seedBase) {
    var orderedQuestions = questions.map(function (question, index) {
      var cloned = {
        id: question.id,
        section: question.section,
        topic: question.topic,
        questionStatus: question.questionStatus,
        text: question.text,
        options: question.options.slice(),
        correctOption: question.correctOption,
        feedbackCorrect: question.feedbackCorrect,
        feedbackIncorrect: question.feedbackIncorrect,
        sourceIndex: index
      };

      if (settings.shuffleOptions) {
        // El barajado es determinista para no romper el progreso guardado.
        cloned.options = seededShuffle(cloned.options, seedBase + "::options::" + cloned.id);
      }

      return cloned;
    });

    if (settings.shuffleQuestions) {
      orderedQuestions = seededShuffle(orderedQuestions, seedBase + "::questions");
    }

    return orderedQuestions;
  }

  function restoreSavedState() {
    var rawState = localStorage.getItem(STORAGE_KEY);
    if (!rawState) {
      return;
    }

    try {
      var saved = JSON.parse(rawState);
      var metaKey = buildStateMetaKey();

      if (saved.metaKey !== metaKey) {
        return;
      }

      state.answers = sanitizeAnswers(saved.answers || {});
      state.completed = Boolean(saved.completed) || Object.keys(state.answers).length === state.questions.length;
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function sanitizeAnswers(answers) {
    var safeAnswers = {};
    state.questions.forEach(function (question) {
      var answer = answers[question.id];
      if (!answer || typeof answer !== "object") {
        return;
      }

      var selected = normalizeOptionValue(answer.selected);
      var isCorrect = Boolean(answer.isCorrect);
      if (!selected) {
        return;
      }

      safeAnswers[question.id] = {
        selected: selected,
        isCorrect: isCorrect
      };
    });
    return safeAnswers;
  }

  function saveState() {
    var payload = {
      metaKey: buildStateMetaKey(),
      answers: state.answers,
      completed: state.completed
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function buildStateMetaKey() {
    return [state.examTitle, state.examVersion, state.questions.length].join("::");
  }

  function render() {
    hide(elements.loadingState);
    hide(elements.errorState);

    elements.examTitle.textContent = state.examTitle;
    elements.examSubtitle.textContent = state.completed
      ? "Has terminado el simulador. Puedes revisar tu resultado o reiniciar."
      : "Todas las preguntas estan visibles para responder una por una con feedback inmediato.";

    renderStats();
    renderStatusBanner();
    renderQuestionsList();
    renderSummary();
    renderIntroModal();
  }

  function renderStats() {
    var totalQuestions = state.questions.length;
    var answeredCount = getAnsweredCount();
    var progressPercent = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    var currentLabel = totalQuestions ? answeredCount + " de " + totalQuestions + " respondidas" : "-";

    elements.questionProgress.textContent = state.completed ? totalQuestions + " de " + totalQuestions + " respondidas" : currentLabel;
    elements.progressPercent.textContent = progressPercent + "%";
    elements.correctCount.textContent = String(getCorrectCount());
    elements.incorrectCount.textContent = String(getIncorrectCount());
    elements.progressBar.style.width = progressPercent + "%";
  }

  function renderStatusBanner() {
    if (state.completed) {
      showStatusBanner("success", "Examen completado. Todas las respuestas ya fueron evaluadas y el resumen final esta visible al final.");
      return;
    }

    if (!state.questions.length) {
      hide(elements.statusBanner);
      return;
    }

    showStatusBanner("info", "Responde cada pregunta desde su propia tarjeta. Al elegir una opcion se bloquea esa pregunta y se muestra el feedback inmediato.");
  }

  function renderQuestionsList() {
    show(elements.questionView);
    elements.sectionBadge.textContent = "Todas las secciones";
    elements.topicBadge.textContent = "Todas las preguntas";
    elements.questionsList.innerHTML = "";

    state.questions.forEach(function (question, questionIndex) {
      elements.questionsList.appendChild(buildQuestionCard(question, questionIndex));
    });
  }

  function renderSummary() {
    var totalQuestions = state.questions.length;
    var correct = getCorrectCount();
    var incorrect = getIncorrectCount();
    var percent = totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0;

    if (!state.completed) {
      hide(elements.summaryView);
      elements.footerNote.textContent = "Responde cada tarjeta para completar el examen y desbloquear el resumen final.";
      return;
    }

    show(elements.summaryView);
    elements.footerNote.textContent = "Resumen desbloqueado. Puedes revisar resultados, descargar la guia o reiniciar.";
    elements.summaryMessage.textContent = buildSummaryMessage(percent);
    elements.summaryScore.textContent = correct + "/" + totalQuestions;
    elements.summaryCorrect.textContent = String(correct);
    elements.summaryIncorrect.textContent = String(incorrect);
    elements.summaryPercent.textContent = percent + "%";
  }

  function buildSummaryMessage(percent) {
    if (percent >= 85) {
      return "Muy buen resultado. MantÃ©n el ritmo y repasa la guÃ­a para consolidar los temas mÃ¡s importantes.";
    }

    if (percent >= 65) {
      return "Vas bien. Hay una base sÃ³lida, pero todavÃ­a conviene reforzar algunos conceptos con la guÃ­a de estudio.";
    }

    return "Hay espacio claro para mejorar. Revisa con calma la guÃ­a de estudio y vuelve a intentar el examen.";
  }

  function selectAnswer(question, option) {
    if (hasAnswered(question.id)) {
      return;
    }

    state.answers[question.id] = {
      selected: option,
      isCorrect: normalizeText(option) === normalizeText(question.correctOption)
    };

    state.completed = getAnsweredCount() === state.questions.length;
    saveState();
    render();
  }

  function restartExam() {
    state.answers = {};
    state.completed = false;
    state.introDismissed = false;
    localStorage.removeItem(STORAGE_KEY);
    render();
  }

  function renderIntroModal() {
    if (!state.questions.length || state.introDismissed) {
      hideIntroModal();
      return;
    }

    showIntroModal();
  }

  function showIntroModal() {
    elements.introModal.classList.remove("hidden");
    elements.introModal.classList.add("flex");
    document.body.classList.add("overflow-hidden");
    elements.introStartBtn.focus();
  }

  function hideIntroModal() {
    elements.introModal.classList.add("hidden");
    elements.introModal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
  }

  function dismissIntroModal() {
    state.introDismissed = true;
    hideIntroModal();
  }

  function downloadStudyGuide() {
    if (!state.questions.length) {
      return;
    }

    // La guÃ­a agrupa las preguntas por secciÃ³n y tema para repaso rÃ¡pido fuera del simulador.
    var lines = [];
    lines.push(state.examTitle);
    lines.push("Guia de estudio");
    lines.push("");

    var grouped = groupQuestionsForGuide(state.questions);
    Object.keys(grouped).forEach(function (sectionName) {
      lines.push("SECCION: " + sectionName);
      lines.push(repeatChar("=", Math.max(sectionName.length + 10, 18)));
      lines.push("");

      Object.keys(grouped[sectionName]).forEach(function (topicName) {
        lines.push("Tema: " + topicName);
        lines.push(repeatChar("-", Math.max(topicName.length + 6, 14)));
        lines.push("");

        grouped[sectionName][topicName].forEach(function (question, index) {
          lines.push((index + 1) + ". Pregunta: " + question.text);
          lines.push("Respuesta correcta: " + question.correctOption);
          lines.push("Explicacion: " + pickBestFeedback(question));
          lines.push("");
        });
      });

      lines.push("");
    });

    var blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    var safeName = slugify(state.examTitle || "guia-estudio");

    link.href = url;
    link.download = safeName + "-guia-estudio.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function groupQuestionsForGuide(questions) {
    return questions.reduce(function (accumulator, question) {
      if (!accumulator[question.section]) {
        accumulator[question.section] = {};
      }

      if (!accumulator[question.section][question.topic]) {
        accumulator[question.section][question.topic] = [];
      }

      accumulator[question.section][question.topic].push(question);
      return accumulator;
    }, {});
  }

  function pickBestFeedback(question) {
    return question.feedbackCorrect || question.feedbackIncorrect || "Sin explicacion disponible.";
  }

  function hasAnswered(questionId) {
    return Boolean(state.answers[questionId]);
  }

  function getAnsweredCount() {
    return Object.keys(state.answers).length;
  }

  function getCorrectCount() {
    return Object.values(state.answers).filter(function (answer) {
      return answer.isCorrect;
    }).length;
  }

  function getIncorrectCount() {
    return Object.values(state.answers).filter(function (answer) {
      return !answer.isCorrect;
    }).length;
  }

  function readFirstDefined(source, keys, fallback) {
    if (!source || typeof source !== "object") {
      return fallback;
    }

    for (var index = 0; index < keys.length; index += 1) {
      var key = keys[index];
      if (Object.prototype.hasOwnProperty.call(source, key) && source[key] != null) {
        return source[key];
      }
    }

    return fallback;
  }

  function uniqueStrings(values) {
    var seen = {};
    return values.filter(function (value) {
      var normalized = normalizeText(value);
      if (!normalized || seen[normalized]) {
        return false;
      }

      seen[normalized] = true;
      return true;
    });
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function seededShuffle(items, seedText) {
    var random = createSeededRandom(seedText);
    var result = items.slice();

    for (var index = result.length - 1; index > 0; index -= 1) {
      var swapIndex = Math.floor(random() * (index + 1));
      var temp = result[index];
      result[index] = result[swapIndex];
      result[swapIndex] = temp;
    }

    return result;
  }

  function createSeededRandom(seedText) {
    var seed = 2166136261;
    var text = String(seedText || "");

    for (var index = 0; index < text.length; index += 1) {
      seed ^= text.charCodeAt(index);
      seed = Math.imul(seed, 16777619);
    }

    return function () {
      seed += 0x6d2b79f5;
      var value = Math.imul(seed ^ seed >>> 15, 1 | seed);
      value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function slugify(value) {
    return normalizeText(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "guia-estudio";
  }

  function repeatChar(character, count) {
    return new Array(count + 1).join(character);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showStatusBanner(type, message) {
    var className = "rounded-2xl border px-4 py-3 text-sm font-medium";

    if (type === "success") {
      className += " border-emerald-200 bg-emerald-50 text-emerald-800";
    } else if (type === "info") {
      className += " border-indigo-200 bg-indigo-50 text-indigo-800";
    } else {
      className += " border-slate-200 bg-slate-50 text-slate-700";
    }

    elements.statusBanner.className = className;
    elements.statusBanner.textContent = message;
    show(elements.statusBanner);
  }

  function showError(message) {
    hide(elements.loadingState);
    hide(elements.questionView);
    hide(elements.summaryView);
    hide(elements.statusBanner);
    elements.errorState.textContent = message;
    show(elements.errorState);
  }

  function buildQuestionCard(question, questionIndex) {
    var card = document.createElement("article");
    var answer = state.answers[question.id];
    var questionStatusBadge = question.questionStatus
      ? "<span class=\"inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold " + buildQuestionOriginClass(question.questionStatus) + "\">" + escapeHtml(question.questionStatus) + "</span>"
      : "";

    card.className = "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";
    card.innerHTML = [
      "<div class=\"flex flex-col gap-4\">",
      "  <div class=\"flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between\">",
      "    <div class=\"space-y-3\">",
      "      <div class=\"flex flex-wrap gap-2\">",
      "        <span class=\"inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700\">Pregunta " + escapeHtml(String(questionIndex + 1)) + "</span>",
      "        <span class=\"inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700\">" + escapeHtml(question.section) + "</span>",
      "        <span class=\"inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700\">" + escapeHtml(question.topic) + "</span>",
      "        " + questionStatusBadge,
      "      </div>",
      "      <p class=\"text-base font-semibold leading-7 text-slate-900 sm:text-lg\">" + escapeHtml(question.text) + "</p>",
      "    </div>",
      "    <span class=\"inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold " + buildQuestionStatusClass(answer) + "\">" + buildQuestionStatusText(answer) + "</span>",
      "  </div>",
      "  <div class=\"grid gap-3\"></div>",
      "</div>"
    ].join("");

    var optionsContainer = card.querySelector(".grid");
    question.options.forEach(function (option, optionIndex) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = buildOptionClass(question, option, answer);
      button.disabled = Boolean(answer);
      button.setAttribute("aria-pressed", answer && answer.selected === option ? "true" : "false");
      button.innerHTML = [
        "<span class=\"flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-sm font-semibold text-slate-700\">",
        String.fromCharCode(65 + optionIndex),
        "</span>",
        "<span class=\"text-left text-sm font-medium leading-6 sm:text-base\">",
        escapeHtml(option),
        "</span>"
      ].join("");

      button.addEventListener("click", function () {
        selectAnswer(question, option);
      });

      optionsContainer.appendChild(button);
    });

    if (answer) {
      card.appendChild(buildFeedbackPanel(question, answer));
    }

    return card;
  }

  function buildOptionClass(question, option, answer) {
    var baseClass = "flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2";

    if (!answer) {
      return baseClass + " border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/60";
    }

    var isSelected = answer.selected === option;
    var isCorrect = question.correctOption === option;

    if (isCorrect) {
      return baseClass + " border-emerald-300 bg-emerald-50 text-emerald-950";
    }

    if (isSelected && !answer.isCorrect) {
      return baseClass + " border-rose-300 bg-rose-50 text-rose-950";
    }

    return baseClass + " border-slate-200 bg-slate-50 text-slate-500";
  }

  function buildFeedbackPanel(question, answer) {
    var panel = document.createElement("div");
    var isCorrect = answer.isCorrect;
    var title = isCorrect ? "Respuesta correcta" : "Respuesta incorrecta";
    var description = isCorrect ? question.feedbackCorrect : question.feedbackIncorrect;

    panel.className = isCorrect
      ? "mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900"
      : "mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-900";

    panel.innerHTML = [
      "<p class=\"text-sm font-semibold uppercase tracking-wide\">", title, "</p>",
      "<p class=\"mt-2 text-sm leading-6\">", escapeHtml(description), "</p>",
      !isCorrect
        ? "<p class=\"mt-3 text-sm font-medium\">Respuesta correcta: <span class=\"font-semibold\">" + escapeHtml(question.correctOption) + "</span></p>"
        : ""
    ].join("");

    return panel;
  }

  function buildQuestionStatusClass(answer) {
    if (!answer) {
      return "bg-slate-100 text-slate-600";
    }

    return answer.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700";
  }

  function buildQuestionOriginClass(questionStatus) {
    if (normalizeText(questionStatus) === normalizeText("Pregunta adicional")) {
      return "bg-amber-100 text-amber-800";
    }

    return "bg-sky-100 text-sky-800";
  }

  function buildQuestionStatusText(answer) {
    if (!answer) {
      return "Pendiente";
    }

    return answer.isCorrect ? "Correcta" : "Incorrecta";
  }

  function show(node) {
    node.classList.remove("hidden");
  }

  function hide(node) {
    node.classList.add("hidden");
  }
})();
