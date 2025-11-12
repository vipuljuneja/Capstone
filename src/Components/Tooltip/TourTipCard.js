import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TourTipCard({
  step, total, title, desc, onNext, onSkip, isLast,
}) {
  return (
    <View style={S.box}>
      <Text style={S.title}>{title}</Text>
      <Text style={S.desc}>{desc}</Text>
      <View style={S.footer}>
        <Text style={S.step}>{step} / {total}</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={onSkip} style={S.skip}>
            <Text style={S.skipTxt}>SKIP</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext} style={S.next}>
            <Text style={S.nextTxt}>{isLast ? 'DONE' : 'NEXT'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  box: { width: 260, padding: 12,  
    backgroundColor: 'transparent', 
    borderWidth: 0,
    borderColor: 'transparent',
  },
  title: { fontWeight: '700', fontSize: 16, marginBottom: 4, color: '#111' },
  desc: { fontSize: 13, color: '#4b5563', marginBottom: 10 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: { fontSize: 12, color: '#6b7280' },
  next: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#3e1f68', marginLeft: 12 },
  nextTxt: { color: '#fff', fontWeight: '700' },
  skip: { paddingHorizontal: 8, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f3f4f6' },
  skipTxt: { color: '#374151', fontWeight: '600' },
});
