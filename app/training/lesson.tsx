import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { apiPost } from "@/utils/api";
import { TRAININGS } from "@/data/trainings";

type Slide = {
  title: string;
  content: string;
  keyPoints: string[];
  emoji: string;
};

type LessonContent = {
  type: "lesson";
  title: string;
  hook: string;
  slides: Slide[];
  summary: string;
  nextStep: string;
};

type QuizQuestion = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

type QuizContent = {
  type: "quiz";
  title: string;
  intro: string;
  questions: QuizQuestion[];
};

type PracticeStep = {
  num: number;
  title: string;
  instruction: string;
  tip: string;
};

type PracticeContent = {
  type: "practice";
  title: string;
  intro: string;
  steps: PracticeStep[];
  conclusion: string;
};

type Content = LessonContent | QuizContent | PracticeContent;

export default function LessonScreen() {
  const params = useLocalSearchParams<{
    trainingId: string;
    moduleTitle: string;
    lessonTitle: string;
    lessonType: string;
    lessonNum: string;
    color: string;
  }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [completed, setCompleted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const training = TRAININGS.find(t => t.id === params.trainingId);
  const color = params.color ?? training?.color ?? "#FF6B00";

  useEffect(() => {
    if (!training) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    pulse.start();

    apiPost<{ success: boolean; lesson: Content }>("/training/lesson", {
      trainingTitle: training.title,
      moduleTitle: params.moduleTitle,
      lessonTitle: params.lessonTitle,
      lessonType: params.lessonType,
      instructor: training.instructor,
    })
      .then(data => {
        setContent(data.lesson);
        setLoading(false);
        pulse.stop();
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        ]).start();
      })
      .catch(e => {
        setError(e.message ?? "Erreur de génération");
        setLoading(false);
        pulse.stop();
      });

    return () => { pulse.stop(); };
  }, []);

  const animateSlide = (nextIdx: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 30, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setSlideIdx(nextIdx);
      slideAnim.setValue(-30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start();
    });
  };

  const handleNextSlide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (content?.type !== "lesson") return;
    if (slideIdx < content.slides.length - 1) {
      animateSlide(slideIdx + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrevSlide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (slideIdx > 0) animateSlide(slideIdx - 1);
  };

  const handleQuizAnswer = (qIdx: number, optIdx: number) => {
    if (quizAnswers[qIdx] !== undefined) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setQuizAnswers(a => ({ ...a, [qIdx]: optIdx }));
    setTimeout(() => setShowExplanation(s => ({ ...s, [qIdx]: true })), 400);
    if (content?.type === "quiz") {
      const allDone = Object.keys({ ...quizAnswers, [qIdx]: optIdx }).length === content.questions.length;
      if (allDone) setTimeout(() => setCompleted(true), 1200);
    }
  };

  const score = content?.type === "quiz"
    ? content.questions.filter((q, i) => quizAnswers[i] === q.correct).length
    : 0;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={[color, color + "AA", "#0A1628"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <Text style={styles.headerSub}>{params.lessonType} · Leçon {params.lessonNum}</Text>
          <Text style={styles.headerTitle} numberOfLines={2}>{params.lessonTitle}</Text>
        </View>
        {content?.type === "lesson" && !completed && (
          <View style={styles.slideProgress}>
            {content.slides.map((_, i) => (
              <View key={i} style={[styles.slideDot, { backgroundColor: i <= slideIdx ? "#FFFFFF" : "rgba(255,255,255,0.3)", width: i === slideIdx ? 20 : 8 }]} />
            ))}
          </View>
        )}
      </LinearGradient>

      {/* CHARGEMENT */}
      {loading && (
        <View style={styles.loadingBox}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <LinearGradient colors={[color + "30", color + "10"]} style={styles.loadingIconBox}>
              <Ionicons name="sparkles" size={40} color={color} />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.loadingTitle}>L'IA prépare votre leçon…</Text>
          <Text style={styles.loadingDesc}>Génération du contenu personnalisé par {training?.instructor}</Text>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map(i => (
              <LoadingDot key={i} delay={i * 200} color={color} />
            ))}
          </View>
        </View>
      )}

      {/* ERREUR */}
      {!loading && error && (
        <View style={styles.errorBox}>
          <Ionicons name="wifi-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Connexion requise</Text>
          <Text style={styles.errorDesc}>La génération IA nécessite une connexion internet.{"\n"}{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setError(null); setLoading(true); }} activeOpacity={0.8}>
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CONTENU LEÇON */}
      {!loading && !error && content?.type === "lesson" && !completed && (
        <>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: botPad + 120 }}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              {/* Hook — seulement sur la 1ère slide */}
              {slideIdx === 0 && (
                <View style={[styles.hookCard, { borderLeftColor: color }]}>
                  <Text style={styles.hookIcon}>💡</Text>
                  <Text style={styles.hookText}>{content.hook}</Text>
                </View>
              )}

              {/* Slide active */}
              {content.slides[slideIdx] && (
                <View style={styles.slideCard}>
                  <View style={styles.slideEmojiRow}>
                    <Text style={styles.slideEmoji}>{content.slides[slideIdx].emoji}</Text>
                    <Text style={[styles.slideCounter, { color }]}>Slide {slideIdx + 1}/{content.slides.length}</Text>
                  </View>
                  <Text style={styles.slideTitle}>{content.slides[slideIdx].title}</Text>
                  <Text style={styles.slideContent}>{content.slides[slideIdx].content}</Text>
                  {content.slides[slideIdx].keyPoints?.length > 0 && (
                    <View style={[styles.keyPointsBox, { borderColor: color + "30", backgroundColor: color + "08" }]}>
                      <Text style={[styles.keyPointsLabel, { color }]}>Points clés</Text>
                      {content.slides[slideIdx].keyPoints.map((pt, i) => (
                        <View key={i} style={styles.keyPointRow}>
                          <View style={[styles.keyPointDot, { backgroundColor: color }]} />
                          <Text style={styles.keyPointText}>{pt}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Dernière slide : résumé */}
              {slideIdx === content.slides.length - 1 && (
                <View style={[styles.summaryCard, { borderColor: color + "40" }]}>
                  <Ionicons name="checkmark-done-circle" size={24} color={color} />
                  <Text style={[styles.summaryTitle, { color }]}>À retenir</Text>
                  <Text style={styles.summaryText}>{content.summary}</Text>
                  <View style={[styles.nextStepRow, { backgroundColor: color + "15" }]}>
                    <Ionicons name="arrow-forward-circle" size={20} color={color} />
                    <Text style={[styles.nextStepText, { color }]}>{content.nextStep}</Text>
                  </View>
                </View>
              )}
            </Animated.View>
          </ScrollView>

          <View style={[styles.navBar, { paddingBottom: botPad + 8 }]}>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnSecondary, { opacity: slideIdx === 0 ? 0.3 : 1 }]}
              onPress={handlePrevSlide}
              disabled={slideIdx === 0}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={20} color="#0A1628" />
              <Text style={styles.navBtnSecondaryText}>Précédent</Text>
            </TouchableOpacity>
            <Text style={styles.navCount}>{slideIdx + 1} / {content.slides.length}</Text>
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: color }]}
              onPress={handleNextSlide}
              activeOpacity={0.85}
            >
              <Text style={styles.navBtnText}>{slideIdx === content.slides.length - 1 ? "Terminer" : "Suivant"}</Text>
              <Ionicons name={slideIdx === content.slides.length - 1 ? "checkmark" : "chevron-forward"} size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* QUIZ */}
      {!loading && !error && content?.type === "quiz" && !completed && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: botPad + 40, gap: 16 }}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={[styles.quizIntro, { borderLeftColor: color }]}>
              <Text style={styles.quizIntroText}>{content.intro}</Text>
            </View>
            {content.questions.map((q, qi) => (
              <View key={qi} style={styles.questionCard}>
                <Text style={styles.questionNum}>Question {qi + 1}</Text>
                <Text style={styles.questionText}>{q.question}</Text>
                {q.options.map((opt, oi) => {
                  const answered = quizAnswers[qi] !== undefined;
                  const isSelected = quizAnswers[qi] === oi;
                  const isCorrect = q.correct === oi;
                  let bg = "#F5F6FA";
                  let border = "#E5E7EB";
                  let textColor = "#374151";
                  if (answered && isCorrect) { bg = "#F0FDF4"; border = "#10B981"; textColor = "#065F46"; }
                  else if (answered && isSelected && !isCorrect) { bg = "#FEF2F2"; border = "#EF4444"; textColor = "#991B1B"; }
                  return (
                    <TouchableOpacity
                      key={oi}
                      style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                      onPress={() => handleQuizAnswer(qi, oi)}
                      disabled={answered}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.optionBubble, { backgroundColor: answered && isCorrect ? "#10B981" : answered && isSelected ? "#EF4444" : color + "20", borderColor: answered && isCorrect ? "#10B981" : answered && isSelected ? "#EF4444" : color }]}>
                        <Text style={[styles.optionBubbleText, { color: answered && (isCorrect || isSelected) ? "#FFFFFF" : color }]}>
                          {String.fromCharCode(65 + oi)}
                        </Text>
                      </View>
                      <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                      {answered && isCorrect && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
                      {answered && isSelected && !isCorrect && <Ionicons name="close-circle" size={20} color="#EF4444" />}
                    </TouchableOpacity>
                  );
                })}
                {showExplanation[qi] && (
                  <View style={[styles.explanation, { borderLeftColor: quizAnswers[qi] === q.correct ? "#10B981" : "#F59E0B" }]}>
                    <Text style={styles.explanationText}>{q.explanation}</Text>
                  </View>
                )}
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      )}

      {/* PRATIQUE */}
      {!loading && !error && content?.type === "practice" && !completed && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: botPad + 40, gap: 16 }}>
          <Animated.View style={{ opacity: fadeAnim, gap: 16 }}>
            <View style={[styles.quizIntro, { borderLeftColor: color }]}>
              <Text style={styles.quizIntroText}>{content.intro}</Text>
            </View>
            {content.steps.map((step) => (
              <View key={step.num} style={styles.practiceStep}>
                <View style={[styles.stepNumBadge, { backgroundColor: color }]}>
                  <Text style={styles.stepNum}>{step.num}</Text>
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepInstruction}>{step.instruction}</Text>
                  <View style={[styles.tipBox, { backgroundColor: color + "12", borderColor: color + "30" }]}>
                    <Ionicons name="bulb-outline" size={14} color={color} />
                    <Text style={[styles.tipText, { color }]}>{step.tip}</Text>
                  </View>
                </View>
              </View>
            ))}
            <View style={[styles.conclusionCard, { borderColor: color + "40" }]}>
              <Ionicons name="star" size={22} color={color} />
              <Text style={styles.conclusionText}>{content.conclusion}</Text>
            </View>
            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: color }]} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setCompleted(true); }} activeOpacity={0.85}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.doneBtnText}>Exercice terminé</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      )}

      {/* ÉCRAN DE COMPLÉTION */}
      {completed && (
        <View style={styles.completionBox}>
          <LinearGradient colors={[color + "20", "transparent"]} style={styles.completionGrad}>
            <Text style={styles.completionEmoji}>
              {content?.type === "quiz" ? (score >= (content?.questions.length ?? 4) * 0.75 ? "🏆" : "📚") : "🎉"}
            </Text>
            <Text style={styles.completionTitle}>
              {content?.type === "quiz" ? `${score}/${(content as QuizContent).questions.length} bonnes réponses` : "Leçon complétée !"}
            </Text>
            <Text style={styles.completionDesc}>
              {content?.type === "quiz"
                ? score >= ((content as QuizContent).questions.length * 0.75)
                  ? "Excellent travail ! Vous maîtrisez ce module."
                  : "Continuez à pratiquer, la maîtrise vient avec la répétition."
                : "Vous progressez. Continuez sur votre lancée !"}
            </Text>
            <TouchableOpacity style={[styles.backLessonBtn, { backgroundColor: color }]} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.back(); }} activeOpacity={0.85}>
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
              <Text style={styles.backLessonBtnText}>Retour aux leçons</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

function LoadingDot({ delay, color }: { delay: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: -8, duration: 350, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.delay(600),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, transform: [{ translateY: anim }] }} />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginTop: 8 },
  headerMeta: { gap: 4, marginBottom: 12 },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_500Medium" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold", lineHeight: 24 },
  slideProgress: { flexDirection: "row", gap: 6, alignItems: "center" },
  slideDot: { height: 6, borderRadius: 3 },
  scroll: { flex: 1 },
  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  loadingIconBox: { width: 90, height: 90, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  loadingTitle: { fontSize: 18, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  loadingDesc: { fontSize: 14, color: "#6B7280", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  loadingDots: { flexDirection: "row", gap: 8, marginTop: 8, alignItems: "flex-end", height: 24 },
  errorBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  errorTitle: { fontSize: 18, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  errorDesc: { fontSize: 14, color: "#6B7280", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FF6B00", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  retryBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  hookCard: { margin: 16, marginBottom: 0, backgroundColor: "#FFFBEB", borderLeftWidth: 4, borderRadius: 12, padding: 14, flexDirection: "row", gap: 10 },
  hookIcon: { fontSize: 22 },
  hookText: { flex: 1, fontSize: 14, color: "#92400E", fontFamily: "Inter_500Medium", lineHeight: 22 },
  slideCard: { margin: 16, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  slideEmojiRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  slideEmoji: { fontSize: 36 },
  slideCounter: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  slideTitle: { fontSize: 20, fontWeight: "800", color: "#0A1628", fontFamily: "Inter_700Bold", lineHeight: 26 },
  slideContent: { fontSize: 15, color: "#374151", fontFamily: "Inter_400Regular", lineHeight: 24 },
  keyPointsBox: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  keyPointsLabel: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  keyPointRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  keyPointDot: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  keyPointText: { flex: 1, fontSize: 14, color: "#374151", fontFamily: "Inter_500Medium", lineHeight: 20 },
  summaryCard: { margin: 16, marginTop: 8, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 10, borderWidth: 1.5 },
  summaryTitle: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  summaryText: { fontSize: 14, color: "#374151", fontFamily: "Inter_400Regular", lineHeight: 22 },
  nextStepRow: { flexDirection: "row", gap: 8, alignItems: "center", padding: 10, borderRadius: 10 },
  nextStepText: { flex: 1, fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  navBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14 },
  navBtnSecondary: { backgroundColor: "#F3F4F6" },
  navBtnSecondaryText: { fontSize: 14, fontWeight: "600", color: "#0A1628", fontFamily: "Inter_600SemiBold" },
  navBtnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  navCount: { fontSize: 13, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  quizIntro: { backgroundColor: "#FFFBEB", borderLeftWidth: 4, borderRadius: 12, padding: 14 },
  quizIntroText: { fontSize: 14, color: "#92400E", fontFamily: "Inter_500Medium", lineHeight: 22 },
  questionCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  questionNum: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", fontFamily: "Inter_700Bold" },
  questionText: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", lineHeight: 22 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: 1.5 },
  optionBubble: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  optionBubbleText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  optionText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  explanation: { borderLeftWidth: 3, paddingLeft: 12, paddingVertical: 8 },
  explanationText: { fontSize: 13, color: "#374151", fontFamily: "Inter_400Regular", lineHeight: 20 },
  practiceStep: { flexDirection: "row", gap: 14, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  stepNumBadge: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  stepNum: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  stepTitle: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  stepInstruction: { fontSize: 14, color: "#374151", fontFamily: "Inter_400Regular", lineHeight: 22 },
  tipBox: { flexDirection: "row", gap: 6, alignItems: "flex-start", borderWidth: 1, borderRadius: 8, padding: 8 },
  tipText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 18 },
  conclusionCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, flexDirection: "row", gap: 12, alignItems: "flex-start", borderWidth: 1.5 },
  conclusionText: { flex: 1, fontSize: 14, color: "#374151", fontFamily: "Inter_500Medium", lineHeight: 22 },
  doneBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16 },
  doneBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  completionBox: { flex: 1 },
  completionGrad: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  completionEmoji: { fontSize: 64 },
  completionTitle: { fontSize: 24, fontWeight: "800", color: "#0A1628", fontFamily: "Inter_700Bold", textAlign: "center" },
  completionDesc: { fontSize: 15, color: "#6B7280", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 24 },
  backLessonBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 16, marginTop: 8 },
  backLessonBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
});
