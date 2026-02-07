import React, { useState } from "react";
import { View } from "react-native";
import { AuthModal } from "./components/AuthModal";

const LoginPage = () => {
  const [authModalVisible, setAuthModalVisible] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: "#001A3D" }}>
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
    </View>
  );
};

export default LoginPage;
