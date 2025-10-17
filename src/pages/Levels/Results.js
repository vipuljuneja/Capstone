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
  const { totalQuestions, transcriptionResults = [] } = route.params || {
    totalQuestions: 0,
    transcriptionResults: [],
  };

  console.log('Transcription route.params:', route.params);

  // Calculate averages from all transcription results
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

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleRetry = () => {
    navigation.navigate('Levels');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Speech Analysis Results</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Summary Card */}
        <View style={styles.resultsCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{stats.avgWpm}</Text>
            <Text style={styles.scoreLabel}>WPM</Text>
          </View>

          <Text style={styles.congratsText}>Analysis Complete!</Text>
          <Text style={styles.summaryText}>
            Completed {totalQuestions} questions
          </Text>
        </View>

        {/* Overall Stats */}
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

        {/* Individual Question Results */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Question Details</Text>

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

        {/* Action Buttons */}
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
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginHorizontal: 16,
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
  detailsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
