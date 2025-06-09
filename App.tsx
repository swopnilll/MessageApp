import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import DatabaseTest from "./src/components/DatabaseTest";

export default function App() {
  return (
    <View style={styles.container}>
      <DatabaseTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
