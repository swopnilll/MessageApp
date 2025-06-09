import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import database from "../../db";

interface User {
  id: string;
  name: string;
  email: string | null;
}

const DatabaseTest: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      console.log("🔍 Loading users...");
      const allUsers = await database.get("users").query().fetch();
      const userList: User[] = allUsers.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      }));
      setUsers(userList);
      console.log("✅ Loaded users:", userList.length);
    } catch (error: any) {
      console.error("❌ Error loading users:", error);
      Alert.alert("Error", "Failed to load users: " + error.message);
    }
  };

  const createUser = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      setLoading(true);
      console.log("🔨 Creating user...", { name, email });

      const newUser = await database.write(async () => {
        return await database.get("users").create((user: any) => {
          user.name = name.trim();
          user.email = email.trim() || null;
        });
      });

      console.log("✅ User created:", newUser.id);

      setName("");
      setEmail("");

      await loadUsers();
      Alert.alert("Success", "User created successfully!");
    } catch (error: any) {
      console.error("❌ Error creating user:", error);
      Alert.alert("Error", "Failed to create user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.log("🗑️ Deleting user:", userId);

      await database.write(async () => {
        const user = await database.get("users").find(userId);
        await user.destroyPermanently();
      });

      console.log("✅ User deleted");
      await loadUsers();
      Alert.alert("Success", "User deleted!");
    } catch (error: any) {
      console.error("❌ Error deleting user:", error);
      Alert.alert("Error", "Failed to delete user: " + error.message);
    }
  };

  const updateUser = async (userId: string) => {
    try {
      console.log("✏️ Updating user:", userId);

      await database.write(async () => {
        const user = await database.get("users").find(userId);
        await user.update((user: any) => {
          user.name = user.name + " (Updated)";
        });
      });

      console.log("✅ User updated");
      await loadUsers();
      Alert.alert("Success", "User updated!");
    } catch (error: any) {
      console.error("❌ Error updating user:", error);
      Alert.alert("Error", "Failed to update user: " + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>WatermelonDB Test</Text>

      {/* Create User Form */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Create User</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter email (optional)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[
            styles.button,
            loading ? styles.buttonDisabled : styles.buttonEnabled,
          ]}
          onPress={createUser}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating..." : "Create User"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Users ({users.length})</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadUsers}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {users.length === 0 ? (
          <Text style={styles.noUsersText}>
            No users found. Create one above!
          </Text>
        ) : (
          users.map((user) => (
            <View key={user.id} style={styles.userRow}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email || "No email"}</Text>
                <Text style={styles.userId}>ID: {user.id.slice(0, 8)}...</Text>
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.updateButton]}
                  onPress={() => updateUser(user.id)}
                >
                  <Text style={styles.actionButtonText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteUser(user.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  form: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  formTitle: { fontSize: 18, fontWeight: "600", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonEnabled: { backgroundColor: "#007AFF" },
  buttonDisabled: { backgroundColor: "#ccc" },
  buttonText: { color: "white", fontWeight: "600" },
  listContainer: { backgroundColor: "white", padding: 20, borderRadius: 10 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  listTitle: { fontSize: 18, fontWeight: "600" },
  refreshButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshButtonText: { color: "white", fontWeight: "600" },
  noUsersText: { textAlign: "center", color: "#666", marginTop: 20 },
  userRow: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "600" },
  userEmail: { fontSize: 14, color: "#666" },
  userId: { fontSize: 12, color: "#999" },
  userActions: { flexDirection: "row" },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  updateButton: { backgroundColor: "#FF9500" },
  deleteButton: { backgroundColor: "#FF3B30", marginRight: 0 },
  actionButtonText: { color: "white", fontSize: 12 },
});

export default DatabaseTest;
