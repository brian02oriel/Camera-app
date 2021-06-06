import React, { Fragment } from "react";
import {ActivityIndicator,  StyleSheet, Text, View, Switch, TouchableOpacity, Image, ImageBackground } from "react-native";
import * as Permissions from 'expo-permissions'
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera'

const axios = require('axios');

initialState = {
  switchValue: true,
  hasCameraPermission: null,
  type: Camera.Constants.Type.back,
  imageuri: "",
  url: "",
  loading: false,
  res: {}
}
export default class App extends React.Component {
  state = {
   ...initialState
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  cameraChange = () => {
    this.setState({
      imageuri: "",
      url: "",
      type:
        this.state.type === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back
    });
  };

  snap = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync();
      if (photo) {
        this.setState({ imageuri: photo.uri });
      }
    }
  };

  clearData = async () => {                                         
    this.setState({ imageuri: "", res: {} });
  }


  upload = async () => {
    this.setState({loading: true})
    let imageBase64 = await FileSystem.readAsStringAsync(this.state.imageuri, {encoding: FileSystem.EncodingType.Base64})
    axios.post('http://192.168.0.13:5000/api/classifier', 
      { base64                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        : imageBase64 })
      .then((response)=> {
        this.setState({res: response.data})
        this.setState({loading: false})
      })
      .catch((error)=>{
        console.error("error: ", error);
        this.setState({loading: false})
    })
  };

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return (
        <View>
          <Text>No cuenta con acceso a la cámara</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          {this.state.switchValue ? (
            <View style={styles.cameraView}>
              {this.state.imageuri != "" ? (
                <ImageBackground
                  source={{
                    uri: this.state.imageuri
                  }}
                  style={styles.uploadedImage}
                  resizeMode="contain"
                >
                  
                  {
                    Object.keys(this.state.res).length > 0 ? (
                      <View style={styles.resultsView}>
                        <Text style={styles.resultText}> Días restantes: { this.state.res["days_lower"] === this.state.res["days_higher"] || Number(this.state.res["days_lower"]) === 0 ? this.state.res["days_higher"] : `${this.state.res["days_lower"]} - ${this.state.res["days_higher"]}` }  </Text>
                      </View>

                    ) : (
                      <Fragment>
                        {
                          this.state.loading &&
                          <View style={styles.resultsLoaderView}>
                              <ActivityIndicator size="large" color="#FFF" />
                          </View> 
                        }
                            
                      </Fragment>
                    )
              }
                  </ImageBackground>
              ) : (
                <Camera
                  style={styles.camera}
                  type={this.state.type}
                  ref={ref => {
                    this.camera = ref;
                  }}
                >
                  <View style={styles.onScreenCameraButtonView}>
                    <TouchableOpacity
                      style={styles.onScreenCameraButtons}
                      onPress={this.cameraChange}
                    >
                      <Text
                        style={styles.onScreenButtonText}
                      >
                        Flip
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.cameraCenter}/>
                  </View>
                </Camera>
              )}
            </View>
          ) : (
            <View style={styles.cameraView}>
              {this.state.url != "" ? (
                <Text>Uploaded url : {this.state.url}</Text>
              ) : null}
              <Text>Cámara inactiva </Text>
            </View>
          )}
            <Fragment>
              <View style={styles.buttonsView}>
              {this.state.imageuri == "" ? (
                <View style={styles.captureButtonView}>
                  <TouchableOpacity
                    style={styles.cameraButtons}
                    onPress={this.snap}
                  >
                    <Text
                      style={styles.buttonText}
                    >
                      Capturar
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : 
              <View style={styles.postCaptureView}>
                <View style={styles.postCaptureButtonView}>
                  <TouchableOpacity
                    style={styles.postCameraButtons}
                    onPress={this.clearData}
                  >
                    <Text
                      style={styles.buttonText}
                    >
                      Capturar
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.postCaptureButtonView}>
                  <TouchableOpacity
                    style={styles.postCameraButtons}
                    onPress={this.upload}
                  >
                    <Text
                      style={styles.buttonText}
                    >
                      Cargar
                    </Text>
                  </TouchableOpacity>
                </View> 
              </View>
              }

            </View>
            </Fragment>
        </View>
      );
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25283d",
    alignItems: "center",
    justifyContent: "flex-start"
  },
  switchview: {
    marginTop: 50,
    backgroundColor: "#FFF",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 5
  },
  switch: {
    padding: 5
  },
  cameraView: {
    minWidth: 400,
    minHeight: 700,
    marginTop: 50,
    backgroundColor: "#000",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  camera: {
    height: 700,
    width: 400,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsView:{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    color: "#FFF",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5, 
  },
  resultText: {
    fontSize: 20,
    padding: 5,
    color: "#FFF",
    backgroundColor: "#00000080"
  },
  resultsLoaderView:{
    width: 350,
    alignItems: 'center',
  },
  cameraButtonView: {
    height: "100%",
    backgroundColor: "transparent"
  },
  cameraButtons: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#FFF",
    borderColor: "#FFF",
    borderWidth: 2,
    padding: 10,
    borderRadius: 5,
    width: 200,
  },
  
  buttonText: {
    fontSize: 18,
    color: "#25283d",
  },
  onScreenCameraButtonView:{
    height: "100%",
    backgroundColor: "transparent"
  },
  onScreenCameraButtons: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: "#FFF",
    borderWidth: 2,
    padding: 10,
    borderRadius: 5,
    width: 75,
    height: 75,
  },
  cameraCenter: {
    borderColor: "#FFFFFF80",
    borderWidth: 2,
    width: 75,
    height: 130,
    marginTop: 235,
  },
  onScreenButtonText:{
    fontSize: 18,
    color: "#FFF",
  },
  captureButtonView: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  postCaptureView:{
    flexDirection: "row",
    justifyContent: "center",
    
  },
  postCaptureButtonView: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postCameraButtons:{
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#FFF",
    borderColor: "#FFF",
    borderWidth: 2,
    borderRadius: 5,
    height: 50,
    width: "90%",
  },
  buttonsView: {
    height: 100,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  uploadedImage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 400,
    minHeight: 700,
  },
  uploadedImageCenter: {
    borderColor: "#FFFFFF80",
    borderWidth: 2,
    width: 75,
    height: 130,
  },
});