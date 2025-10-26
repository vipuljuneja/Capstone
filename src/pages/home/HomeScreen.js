import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import NotebookIcon from '../../../assets/icons/notebook.svg';
import MailboxIcon from '../../../assets/icons/mailbox.svg';
import MicIcon from '../../../assets/icons/mic.svg';
import ProfileIcon from '../../../assets/icons/profile.svg';
import EllipseIcon from '../../../assets/icons/ellipse3d.svg';

export default function HomeScreen() {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const scenarios = [
    {
      id: 1,
      title: 'Ordering Coffee',
      desc: 'Practice ordering drinks',
      emoji: '☕',
    },
    { id: 2, title: 'Restaurant', desc: 'Order food confidently', emoji: '🍽️' },
    { id: 3, title: 'Shopping', desc: 'Shopping conversations', emoji: '🛍️' },
  ];

  const handlePractice = scenario => {
    navigation.navigate('LevelOptions', {
      scenarioTitle: scenario.title,
      scenarioEmoji: scenario.emoji,
      scenarioId: scenario.id,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <TouchableOpacity
            style={{
              backgroundColor: 'orange',
              padding: 16,
              borderRadius: '50%',
            }}
          >
            <NotebookIcon width={32} height={32} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: 'orange',
              padding: 16,
              borderRadius: '50%',
            }}
          >
            <MailboxIcon width={32} height={32} />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={{
              backgroundColor: 'orange',
              padding: 16,
              borderRadius: '50%',
            }}
          >
            <ProfileIcon width={32} height={32} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View
          style={[
            styles.scenariosWrapper,
            { opacity: visible ? 1 : 0, height: visible ? 180 : 0 },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pointerEvents={visible ? 'auto' : 'none'}
          >
            {scenarios.map(item => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardEmoji}>
                  <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePractice(item)}
                >
                  <Text style={styles.buttonText}>PRACTICE</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Character */}
        <Image
          source={require('../../../assets/pipo_set.png')}
          style={{ height: screenHeight * 0.4 }}
        />

        {/* Close Button */}
        <TouchableOpacity
          style={[styles.close, { opacity: visible ? 1 : 0 }]}
          onPress={() => setVisible(false)}
          disabled={!visible}
        >
          <Text style={{ fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Mic Button */}
      <View
        style={[
          styles.micWrapper,
          { opacity: visible ? 0 : 1, height: visible ? 0 : 'auto' },
        ]}
      >
        <TouchableOpacity
          style={{
            borderColor: 'blue',
            // borderWidth: 1,
            padding: 16,
            borderRadius: '50%',
          }}
          onPress={() => setVisible(true)}
          disabled={visible}
        >
          <View
            style={{
              backgroundColor: 'orange',
              width: 100,
              height: 100,
              borderRadius: '50%',
            }}
          ></View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerIcon: {
    flexDirection: 'row',
    gap: 16,
  },
  icon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scenariosWrapper: {
    marginBottom: 15,
    overflow: 'hidden',
  },
  card: {
    width: 230,
    margin: 8,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  cardEmoji: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8E8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 11,
    color: '#666',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4A4458',
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 13,
  },
  character: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#D4C4F8',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  characterSmall: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D4C4F8',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  close: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  micWrapper: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  mic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startImage: {
    width: 200,
    height: 200,
  },
});
