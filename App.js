import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import Video from 'react-native-video';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

export default function App() {
  const [videoURI, setVideoURI] = useState(null);
  const [refresh, setRefresh] = useState(false); // 버튼 눌림 여부를 추적하는 상태

  // 비디오 가져오기 함수
  const getLatestVideo = async () => {
    try {
      // 카메라 롤에서 동영상 가져오기
      const response = await CameraRoll.getPhotos({
        first: 1,
        assetType: 'Videos',
      });

      if (response && response.edges.length > 0) {
        const mostRecentVideo = response.edges[0].node.image.uri;
        setVideoURI(mostRecentVideo);
        console.log('mostRecentVideo: ', mostRecentVideo);
      } else {
        console.log('동영상을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('동영상을 불러오는 동안 오류 발생:', error);
    }
  };

  useEffect(() => {
    if (refresh) {
      // 버튼을 눌렀을 때만 실행
      getLatestVideo();
      setRefresh(false); // 버튼 누른 후 다시 false로 설정
    }
  }, [refresh]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}> My First React Native</Text>
      {videoURI ? (
        <Video
          source={{uri: videoURI}}
          style={styles.video}
          controls
          resizeMode="contain"
        />
      ) : (
        <Text>동영상이 로드되지 않았습니다.</Text>
      )}

      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => setRefresh(true)} // 버튼 누를 때 refresh 상태를 true로 설정
      >
        <Text style={styles.buttonText}>동영상 가져오기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 30,
  },
  mainButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: 'blue',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  video: {
    width: 300,
    height: 200,
  },
});
