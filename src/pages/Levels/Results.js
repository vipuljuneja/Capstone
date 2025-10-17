import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Results = ({ navigation, route }) => {
  const {
    totalQuestions,
    transcriptionResults = [],
    facialAnalysisResults = [],
  } = route.params || {
    totalQuestions: 0,
    transcriptionResults: [],
    facialAnalysisResults: [],
  };

  console.log('Transcription route.params:', route.params);

  const facialAnalysis =
    facialAnalysisResults && facialAnalysisResults.length > 0
      ? facialAnalysisResults[0]
      : null;

  const calculateAverages = () => {
    if (!transcriptionResults || transcriptionResults.length === 0) {
      return {
        avgWpm: 0,
        avgFillerWords: 0,
        avgPauses: 0,
        totalDuration: 0,
      };
    }

    const totals = transcriptionResults.reduce(
      (acc, result) => ({
        wpm: acc.wpm + (result.wpm || 0),
        fillerWords: acc.fillerWords + (result.fillerWordCount || 0),
        pauses: acc.pauses + (result.pauseCount || 0),
        duration: acc.duration + parseFloat(result.duration || 0),
      }),
      { wpm: 0, fillerWords: 0, pauses: 0, duration: 0 },
    );

    const count = transcriptionResults.length;

    return {
      avgWpm: Math.round(totals.wpm / count),
      avgFillerWords: Math.round(totals.fillerWords / count),
      avgPauses: Math.round(totals.pauses / count),
      totalDuration: totals.duration.toFixed(2),
    };
  };

  const stats = calculateAverages();

  const getScoreColor = score => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getSeverityColor = severity => {
    switch (severity) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f97316';
      case 'low':
        return '#fbbf24';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return '#fee2e2';
      case 'medium':
        return '#fed7aa';
      case 'low':
        return '#fef3c7';
      default:
        return '#f3f4f6';
    }
  };

  const getPriorityTextColor = priority => {
    switch (priority) {
      case 'high':
        return '#991b1b';
      case 'medium':
        return '#9a3412';
      case 'low':
        return '#92400e';
      default:
        return '#374151';
    }
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleRetry = () => {
    navigation.navigate('Levels');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interview Analysis Results</Text>
          <View style={styles.placeholder} />
        </View>

        {facialAnalysis && (
          <View style={styles.resultsCard}>
            <View
              style={[
                styles.scoreCircle,
                {
                  borderColor: getScoreColor(
                    facialAnalysis.summary.overallScore,
                  ),
                  borderWidth: 8,
                },
              ]}
            >
              <Text style={styles.scoreText}>
                {facialAnalysis.summary.overallScore}
              </Text>
              <Text style={styles.scoreLabel}>
                {facialAnalysis.summary.level}
              </Text>
            </View>

            <Text style={styles.congratsText}>Overall Performance Score</Text>
            <View style={styles.sessionInfoRow}>
              <View style={styles.sessionInfoItem}>
                <Text style={styles.sessionInfoLabel}>Duration</Text>
                <Text style={styles.sessionInfoValue}>
                  {facialAnalysis.summary.duration}s
                </Text>
              </View>
              <View style={styles.sessionInfoItem}>
                <Text style={styles.sessionInfoLabel}>Frames</Text>
                <Text style={styles.sessionInfoValue}>
                  {facialAnalysis.summary.totalFrames}
                </Text>
              </View>
              <View style={styles.sessionInfoItem}>
                <Text style={styles.sessionInfoLabel}>Questions</Text>
                <Text style={styles.sessionInfoValue}>{totalQuestions}</Text>
              </View>
            </View>
          </View>
        )}

        {facialAnalysis && (
          <>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Performance Metrics</Text>
              <View style={styles.metricsGrid}>
                {Object.entries(facialAnalysis.scores).map(([key, score]) => (
                  <View key={key} style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricName}>
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .trim()
                          .replace(/^./, str => str.toUpperCase())}
                      </Text>
                      <View
                        style={[
                          styles.metricBadge,
                          { backgroundColor: getScoreColor(score) },
                        ]}
                      >
                        <Text style={styles.metricBadgeText}>{score}</Text>
                      </View>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${score}%`,
                            backgroundColor: getScoreColor(score),
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>💪 Your Strengths</Text>
              {facialAnalysis.strengths.map((strength, index) => (
                <View key={index} style={styles.strengthCard}>
                  <View style={styles.strengthHeader}>
                    <View style={styles.strengthBadge}>
                      <Text style={styles.strengthBadgeText}>
                        {strength.score}
                      </Text>
                    </View>
                    <Text style={styles.strengthMetric}>{strength.metric}</Text>
                  </View>
                  <Text style={styles.strengthMessage}>{strength.message}</Text>
                  <View style={styles.impactBox}>
                    <Text style={styles.impactLabel}>Impact:</Text>
                    <Text style={styles.impactText}>{strength.impact}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>🎯 Areas for Improvement</Text>
              {facialAnalysis.weaknesses.map((weakness, index) => (
                <View
                  key={index}
                  style={[
                    styles.weaknessCard,
                    {
                      borderLeftColor: getSeverityColor(weakness.severity),
                      borderLeftWidth: 4,
                    },
                  ]}
                >
                  <View style={styles.weaknessHeader}>
                    <Text style={styles.weaknessMetric}>{weakness.metric}</Text>
                    <View
                      style={[
                        styles.severityBadge,
                        {
                          backgroundColor: getSeverityColor(weakness.severity),
                        },
                      ]}
                    >
                      <Text style={styles.severityBadgeText}>
                        {weakness.severity}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.weaknessScore}>
                    Score: {weakness.score}/100
                  </Text>
                  <Text style={styles.weaknessIssue}>{weakness.issue}</Text>
                  <View style={styles.whyBox}>
                    <Text style={styles.whyLabel}>Why it matters:</Text>
                    <Text style={styles.whyText}>{weakness.why}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>📋 Recommendations</Text>
              {facialAnalysis.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationCard}>
                  <View style={styles.recommendationHeader}>
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(rec.priority) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          { color: getPriorityTextColor(rec.priority) },
                        ]}
                      >
                        {rec.priority.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.recommendationArea}>{rec.area}</Text>
                  </View>
                  <View style={styles.recommendationSection}>
                    <Text style={styles.recommendationLabel}>Issue:</Text>
                    <Text style={styles.recommendationText}>{rec.issue}</Text>
                  </View>
                  <View style={styles.recommendationSection}>
                    <Text style={styles.recommendationLabel}>
                      Recommendation:
                    </Text>
                    <Text style={styles.recommendationText}>
                      {rec.recommendation}
                    </Text>
                  </View>
                  <View style={styles.recommendationSection}>
                    <Text style={styles.recommendationLabel}>Exercise:</Text>
                    <Text style={styles.recommendationText}>
                      {rec.exercise}
                    </Text>
                  </View>
                  <View style={styles.impactBanner}>
                    <Icon name="lightning-bolt" size={16} color="#f59e0b" />
                    <Text style={styles.impactBannerText}>{rec.impact}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>🔍 Key Insights</Text>
              <View style={styles.insightsCard}>
                {facialAnalysis.keyInsights.map((insight, index) => (
                  <View key={index} style={styles.insightRow}>
                    <Text style={styles.insightIcon}>
                      {insight.startsWith('✓')
                        ? '✓'
                        : insight.startsWith(' ')
                        ? '⚠'
                        : '📊'}
                    </Text>
                    <Text style={styles.insightText}>
                      {insight.replace(/^[✓ ]/, '').trim()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>📊 Detailed Metrics</Text>

              <View style={styles.detailMetricCard}>
                <Text style={styles.detailMetricTitle}>Eye Contact & Gaze</Text>
                <View style={styles.detailMetricRow}>
                  <Text style={styles.detailMetricLabel}>Stability Score:</Text>
                  <Text style={styles.detailMetricValue}>
                    {facialAnalysis.detailedMetrics.gaze.stabilityScore}
                  </Text>
                </View>
                <View style={styles.detailMetricRow}>
                  <Text style={styles.detailMetricLabel}>Is Stable:</Text>
                  <Text
                    style={[
                      styles.detailMetricValue,
                      {
                        color: facialAnalysis.detailedMetrics.gaze.isStable
                          ? '#10b981'
                          : '#ef4444',
                      },
                    ]}
                  >
                    {facialAnalysis.detailedMetrics.gaze.isStable
                      ? 'Yes'
                      : 'No'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailMetricCard}>
                <Text style={styles.detailMetricTitle}>Blinking Analysis</Text>
                <View style={styles.detailMetricRow}>
                  <Text style={styles.detailMetricLabel}>Total Blinks:</Text>
                  <Text style={styles.detailMetricValue}>
                    {facialAnalysis.detailedMetrics.blinking.total}
                  </Text>
                </View>
                <View style={styles.detailMetricRow}>
                  <Text style={styles.detailMetricLabel}>Per Minute:</Text>
                  <Text style={styles.detailMetricValue}>
                    {facialAnalysis.detailedMetrics.blinking.perMinute}
                  </Text>
                </View>
                <View style={styles.detailMetricRow}>
                  <Text style={styles.detailMetricLabel}>Excessive:</Text>
                  <Text
                    style={[
                      styles.detailMetricValue,
                      {
                        color: facialAnalysis.detailedMetrics.blinking
                          .isExcessive
                          ? '#ef4444'
                          : '#10b981',
                      },
                    ]}
                  >
                    {facialAnalysis.detailedMetrics.blinking.isExcessive
                      ? 'Yes'
                      : 'No'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailMetricCard}>
                <Text style={styles.detailMetricTitle}>Facial Expressions</Text>
                <View style={styles.detailMetricRow}>
                  <Text style={styles.detailMetricLabel}>
                    Smile Percentage:
                  </Text>
                  <Text style={styles.detailMetricValue}>
                    {facialAnalysis.detailedMetrics.smiles.percentage}%
                  </Text>
                </View>
                <View style={styles.detailMetricRow}>
                  <Text style={styles.detailMetricLabel}>Genuine Smiles:</Text>
                  <Text style={styles.detailMetricValue}>
                    {facialAnalysis.detailedMetrics.smiles.genuine}
                  </Text>
                </View>
                <View style={styles.detailMetricRow}>
                  <Text style={styles.detailMetricLabel}>Forced Smiles:</Text>
                  <Text style={styles.detailMetricValue}>
                    {facialAnalysis.detailedMetrics.smiles.forced}
                  </Text>
                </View>
              </View>

              <View style={styles.detailMetricCard}>
                <Text style={styles.detailMetricTitle}>
                  Tension & Composure
                </Text>
                <View style={styles.detailMetricRow}>
                  <Text style={styles.detailMetricLabel}>Average Tension:</Text>
                  <Text style={styles.detailMetricValue}>
                    {facialAnalysis.detailedMetrics.tension.average}
                  </Text>
                </View>
                <View style={styles.detailMetricRow}>
                  <Text style={styles.detailMetricLabel}>Max Tension:</Text>
                  <Text style={styles.detailMetricValue}>
                    {facialAnalysis.detailedMetrics.tension.max}
                  </Text>
                </View>
                <View style={styles.detailMetricRow}>
                  <Text style={styles.detailMetricLabel}>High Tension:</Text>
                  <Text
                    style={[
                      styles.detailMetricValue,
                      {
                        color: facialAnalysis.detailedMetrics.tension.isHigh
                          ? '#ef4444'
                          : '#10b981',
                      },
                    ]}
                  >
                    {facialAnalysis.detailedMetrics.tension.isHigh
                      ? 'Yes'
                      : 'No'}
                  </Text>
                </View>
              </View>

              {facialAnalysis.detailedMetrics.eyeRolls.count > 0 && (
                <View style={styles.detailMetricCard}>
                  <Text style={styles.detailMetricTitle}>
                    Eye Rolls Detected
                  </Text>
                  <View style={styles.detailMetricRow}>
                    <Text style={styles.detailMetricLabel}>Count:</Text>
                    <Text
                      style={[styles.detailMetricValue, { color: '#ef4444' }]}
                    >
                      {facialAnalysis.detailedMetrics.eyeRolls.count}
                    </Text>
                  </View>
                  {facialAnalysis.detailedMetrics.eyeRolls.details.map(
                    (detail, idx) => (
                      <View key={idx} style={styles.eyeRollDetail}>
                        <Text style={styles.eyeRollDetailText}>
                          Frame {detail.frameIndex} - Intensity:{' '}
                          {detail.intensity.toFixed(2)}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              )}

              {facialAnalysis.detailedMetrics.microExpressions.count > 0 && (
                <View style={styles.detailMetricCard}>
                  <Text style={styles.detailMetricTitle}>
                    Micro Expressions
                  </Text>
                  <View style={styles.detailMetricRow}>
                    <Text style={styles.detailMetricLabel}>Total Count:</Text>
                    <Text style={styles.detailMetricValue}>
                      {facialAnalysis.detailedMetrics.microExpressions.count}
                    </Text>
                  </View>
                  {Object.entries(
                    facialAnalysis.detailedMetrics.microExpressions.types,
                  ).map(([type, count]) => (
                    <View key={type} style={styles.detailMetricRow}>
                      <Text style={styles.detailMetricLabel}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}:
                      </Text>
                      <Text style={styles.detailMetricValue}>{count}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🎤 Speech Analysis</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="speedometer" size={24} color="#2196F3" />
              <Text style={styles.statValue}>{stats.avgWpm}</Text>
              <Text style={styles.statLabel}>Avg WPM</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="clock-outline" size={24} color="#FFC107" />
              <Text style={styles.statValue}>{stats.totalDuration}s</Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="pause-circle" size={24} color="#FF9800" />
              <Text style={styles.statValue}>{stats.avgPauses}</Text>
              <Text style={styles.statLabel}>Avg Pauses</Text>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>Question Details</Text>

          {transcriptionResults.map((result, index) => (
            <View key={index} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Question {index + 1}</Text>
                <Text style={styles.durationText}>{result.duration}s</Text>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>WPM</Text>
                  <Text style={styles.metricValue}>{result.wpm}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Filler Words</Text>
                  <Text style={styles.metricValue}>
                    {result.fillerWordCount}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Pauses</Text>
                  <Text style={styles.metricValue}>{result.pauseCount}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Words</Text>
                  <Text style={styles.metricValue}>{result.totalWords}</Text>
                </View>
              </View>

              {result.transcript &&
                result.transcript !== 'No transcription' && (
                  <View style={styles.transcriptContainer}>
                    <Text style={styles.transcriptLabel}>Transcript:</Text>
                    <Text style={styles.transcriptText}>
                      {result.transcript}
                    </Text>
                  </View>
                )}

              {result.fillerWords && result.fillerWords.length > 0 && (
                <View style={styles.fillersContainer}>
                  <Text style={styles.fillersLabel}>
                    Filler Words Detected:
                  </Text>
                  <View style={styles.fillersList}>
                    {result.fillerWords.map((filler, idx) => (
                      <Text key={idx} style={styles.fillerItem}>
                        "{filler.word}" ({filler.time}s)
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleRetry}>
            <Icon name="replay" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
          >
            <Icon name="home" size={20} color="#333" />
            <Text style={styles.secondaryButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  resultsCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  congratsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sessionInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  sessionInfoItem: {
    alignItems: 'center',
  },
  sessionInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sessionInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  metricsGrid: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  metricBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  strengthCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  strengthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  strengthBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065f46',
  },
  strengthMetric: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  strengthMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  impactBox: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  impactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 4,
  },
  impactText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
  weaknessCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  weaknessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weaknessMetric: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  weaknessScore: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  weaknessIssue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  whyBox: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  whyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 4,
  },
  whyText: {
    fontSize: 13,
    color: '#dc2626',
    lineHeight: 18,
  },
  recommendationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  recommendationArea: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  recommendationSection: {
    marginBottom: 12,
  },
  recommendationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  impactBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  impactBannerText: {
    fontSize: 13,
    color: '#d97706',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  insightsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  insightText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  detailMetricCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  detailMetricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailMetricLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  eyeRollDetail: {
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  eyeRollDetailText: {
    fontSize: 12,
    color: '#dc2626',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  questionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transcriptContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  fillersContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  fillersLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 6,
  },
  fillersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fillerItem: {
    fontSize: 12,
    color: '#E65100',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default Results;
