import React, {useEffect, useState, useRef} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import Video from 'react-native-video';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import {RNCamera} from 'react-native-camera';

export default function App() {
  const cameraRef = useRef(null); // 카메라 컴포넌트에 대한 ref를 생성
  const [videoURI, setVideoURI] = useState(null);
  const [refresh, setRefresh] = useState(false); // 버튼 눌림 여부를 추적하는 상태
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(3);
  // 카운트 다운 시작 함수
  const startCountdown = () => {
    let timer = setInterval(() => {
      setCountdown(prevCountdown => prevCountdown - 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      startRecording();
    }, 3000);
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        const { uri } = await cameraRef.current.recordAsync();
        const saveUri = await CameraRoll.saveToCameraRoll(uri, 'video');
        console.log('동영상이 저장된 경로:', uri);
        console.log('사진앱에 저장된 경로: ', saveUri);
        setCountdown(3); // 카운트 다운 초기화
      } catch (error) {
        console.error('동영상 녹화 중 오류 발생:', error);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  };

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

        // 'ph://' 형식의 동영상 URI를 복사할 대상 경로
        const destPath = RNFS.DocumentDirectoryPath + '/myVideo1.mov';

        // 'ph://' 형식의 동영상 URI를 복사
        await RNFS.copyAssetsVideoIOS(mostRecentVideo, destPath);

        // 복사된 동영상 파일의 경로를 설정하여 상태 업데이트
        setVideoURI(destPath);
        console.log('mostRecentVideo: ', mostRecentVideo);
        console.log('복사된 동영상 경로:', destPath);
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
      <Text style={styles.title}> 제발 좀 되라고</Text>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        autoFocus={RNCamera.Constants.AutoFocus.on}
      />
      {countdown > 0 && <Text style={styles.countdownText}>{countdown}초</Text>}
      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => {
          if (!isRecording) {
            startCountdown(); // 카운트 다운 시작
            setIsRecording(true);
          } else {
            stopRecording();
            setIsRecording(false);
          }
        }}>
        <Text style={styles.buttonText}>
          {isRecording ? '녹화 중지' : '녹화 시작'}
        </Text>
      </TouchableOpacity>
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
  camera: {
    width: 300,
    height: 200,
    marginBottom: 20,
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
