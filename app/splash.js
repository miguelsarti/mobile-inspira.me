import { View, Text, Image, StyleSheet } from 'react-native';

export default function Splash() {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/logo.png')} 
        style={styles.logo}
      />
      <Text style={styles.title}>Inspira.me</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7DA1C4', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 130,
    height: 130,
    borderRadius: 70,
  },
  title: {
    marginTop: 20,
    fontSize: 26,
    color: 'white',
    fontFamily: 'InriaSerif', 
    fontWeight: '500',
  },
  
});
