import { StyleSheet, Text, View, Modal, Button } from 'react-native';
import React from 'react'
import { Calendar } from "react-native-calendars";

const FullCalendar = ({ selectedDate, modalVisible, setModalVisible, setSelectedDate }) => {
    
    const onDaySelect = (day) => {
        setSelectedDate(day.dateString);
        setModalVisible(false);
    }

  return (
      <Modal
            animationType="slide"
            transparent={true}
           
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(false);
            }}
        >
            
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Calendar
                        initialDate={selectedDate}
                        onDayPress={onDaySelect} 
                        enableSwipeMonths={true}
                    />

                    <Button
                        title="Close"
                        onPress={() => setModalVisible(false)}
                    />
                </View>
            </View>
        </Modal>
  )
}

export default FullCalendar

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      },
      modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20, 
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },
});

