import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function LevelsScreen() {
  return <View style={S.wrap}><Text style={S.txt}>Levels coming soon</Text></View>;
}
const S = StyleSheet.create({ wrap:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#0f172a'}, txt:{color:'#fff',fontSize:18,fontWeight:'600'} });
