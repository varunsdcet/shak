import React, {Component, PureComponent} from 'react'
import {
    StyleSheet, Text, View, TouchableOpacity,
    Dimensions, Modal, NativeModules, Image,Alert,
} from 'react-native'
import CountDown from 'react-native-countdown-component';
const window = Dimensions.get('window');
import { EventRegister } from 'react-native-event-listeners';
import LottieView from 'lottie-react-native';
import {Surface, ActivityIndicator} from 'react-native-paper'
const GLOBAL = require('./Global');
import NetInfo from "@react-native-community/netinfo";
import {RtcEngine, AgoraView} from 'react-native-agora'

import {APPID} from './settingss'
import {Stopwatch} from "react-native-stopwatch-timer";
const {Agora} = NativeModules
console.log(Agora)
const options = {
    container: {
        backgroundColor: 'transparent',
    },
    text: {
        fontSize: 12,
        color: '#fff',
    }
};
if (!Agora) {
    throw new Error("Agora load failed in react-native, please check ur compiler environments")
}

const {
    FPS30,
    AudioProfileDefault,
    AudioScenarioDefault,
    Host,
    Audience,
    Adaptative
} = Agora

const BtnEndCall = () => require('./btn_endcall.png')
const BtnMute = () => require('./btn_mute.png')
const BtnSwitchCamera = () => require('./btn_switch_camera.png')
const IconMuted = () => require('./icon_muted.png')

const {width} = Dimensions.get('window')

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F4F4'
    },
    absView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
    },
    videoView: {
        padding: 5,
        flexWrap: 'wrap',
        flexDirection: 'row',
        zIndex: 100
    },
    localView: {
        flex: 1
    },
    duration: {
      position: 'absolute',
      top: 130,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
  },
  absView: {
      position: 'absolute',
      top: 70,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'space-between',
  },
  absViews: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width:window.width,
      height:80,
      justifyContent: 'space-between',
  },
    remoteView: {
        width: (width - 40) / 3,
        height: (width - 40) / 3,
        margin: 5
    },
    bottomView: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-around'
    }
})

class OperateButton extends PureComponent {
    render() {
        const {onPress, source, style, imgStyle = {width: 40, height: 40,resizeMode:'contain',marginTop:6}} = this.props
        return (
            <TouchableOpacity
                style={style}
                onPress={onPress}
                activeOpacity={.7}
            >
                <Image
                    style={imgStyle}
                    source={source}
                />
            </TouchableOpacity>
        )
    }
}

type Props = {
    channelProfile: Number,
    channelName: String,
    clientRole: Number,
    onCancel: Function,
    uid: Number,
}

class VideoCall extends Component<Props> {
    state = {
        peerIds: [],
        joinSucceed: false,
        isMute: false,
        hideButton: false,
        visible: false,
        selectedUid: undefined,
        animating: true,
        isMutes:false,
        connectionState: 'connecting',
        stopwatchStart: false,
        stopwatchReset: false,
    }

    componentWillMount () {
      this.listener = EventRegister.addEventListener('pujaend', (data) => {
                this.props.navigation.goBack()
                })

        // const options = {
        //     appid: 'ef38b64215ed49d2acc3c6d8e20439f4',
        //     channelProfile: 1,
        //     videoProfile: 40,
        //     clientRole: 1,
        //     swapWidthAndHeight: true
        // };
        // RtcEngine.init(options);


        const config = {
            appid: APPID,
            channelProfile: this.props.channelProfile,
            clientRole: this.props.clientRole,
            videoEncoderConfig: {
                width: 360,
                height: 480,
                bitrate: 1,
                frameRate: FPS30,
                orientationMode: Adaptative,
            },
            swapWidthAndHeight:true,
            audioProfile: AudioProfileDefault,
            audioScenario: AudioScenarioDefault
        }
        console.log("[CONFIG]", JSON.stringify(config));
        console.log("[CONFIG.encoderConfig", config.videoEncoderConfig);
        RtcEngine.on('videoSizeChanged', (data) => {
            console.log("[RtcEngine] videoSizeChanged ", data)
        })
        RtcEngine.on('remoteVideoStateChanged', (data) => {
            console.log('[RtcEngine] `remoteVideoStateChanged`', data);
        })
        RtcEngine.on('userJoined', (data) => {
        //  alert(JSON.stringify(data))
            console.log('[RtcEngine] onUserJoined', data);
            const {peerIds} = this.state;
            if (peerIds.indexOf(data.uid) === -1) {
              this.setState({stopwatchStart:true})
              this.setState({connectionState:'connected'})
                this.setState({
                    peerIds: [...peerIds, data.uid]
                })
            }
        })
        RtcEngine.on('userOffline', (data) => {
            console.log('[RtcEngine] onUserOffline', data);
            this.setState({
                peerIds: this.state.peerIds.filter(uid => uid !== data.uid)
            })
            console.log('peerIds', this.state.peerIds, 'data.uid ', data.uid)
        })
        RtcEngine.on('joinChannelSuccess', (data) => {
            console.log('[RtcEngine] onJoinChannelSuccess', data);
            RtcEngine.startPreview().then(_ => {
                this.setState({
                    joinSucceed: true,
                    animating: false
                })
            })
        })
        RtcEngine.on('audioVolumeIndication', (data) => {
            console.log('[RtcEngine] onAudioVolumeIndication', data);
        })
        RtcEngine.on('clientRoleChanged', (data) => {
            console.log("[RtcEngine] onClientRoleChanged", data);
        })
        RtcEngine.on('videoSizeChanged', (data) => {
            console.log("[RtcEngine] videoSizeChanged", data);
        })
        RtcEngine.on('error', (data) => {
            console.log('[RtcEngine] onError', data);
            if (data.error === 17) {
                RtcEngine.leaveChannel().then(_ => {
                    this.setState({
                        joinSucceed: false
                    })
                    const { state, goBack } = this.props.navigation;
                    this.props.onCancel(data);
                    goBack();
                })
            }
        })
        RtcEngine.init(config);
    }

    toggleStopwatch = () => {
       this.setState({stopwatchStart: !this.state.stopwatchStart, stopwatchReset: false});
   };
   resetStopwatch() {
       this.setState({stopwatchStart: false, stopwatchReset: true});
   }
   getFormattedTime(time) {
      // this.currentTime = time;
   }


   navigateToScreen1 = () => {
     this.prop.navigation.reset({
                     index: 0,
                     routes: [{name: 'TabNavigator'}],
                   });
               // alert

       // Alert.alert('Complete Booking!','Are you sure you want to Complete Booking?',
       //     [{text:"Cancel"},
       //         {text:"Yes", onPress:()=>this.handleCancel()
       //         },
       //     ],
       //     {cancelable:false}
       // )

   }


    componentDidMount () {
        if (GLOBAL.user_id != "0"){
      // this.getlog()
      }
      const unsubscribe = NetInfo.addEventListener(state => {

                if (state.isConnected == true){
                  console.log(state.isConnected)

                }
})
        RtcEngine.getSdkVersion((version) => {
            console.log('[RtcEngine] getSdkVersion', version);
        })

        console.log('[joinChannel] ' + this.props.channelName);
        RtcEngine.joinChannel(this.props.channelName, this.props.uid)
            .then(result => {
                /**
                 * ADD the code snippet after join channel success.
                 */
            });
        RtcEngine.enableAudioVolumeIndication(500, 3,true)

    }

    shouldComponentUpdate(nextProps) {
        return nextProps.navigation.isFocused();
    }


    componentWillUnmount () {

        if (this.state.joinSucceed) {
            RtcEngine.leaveChannel().then(res => {
                RtcEngine.destroy()
            }).catch(err => {
                RtcEngine.destroy()
                console.log("leave channel failed", err);
            })
        } else {
            RtcEngine.destroy()
        }
    }

    handleCancel = () => {



        const { goBack } = this.props.navigation;
        RtcEngine.leaveChannel().then(_ => {
            this.setState({
                joinSucceed: false
            })

        }).catch(err => {
            console.log("[agora]: err", err)
        })


      //   const url = 'http://139.59.76.223/shaktipeeth/api/force_booking_done_complete_online'
      // fetch(url, {
      // method: 'POST',
      // headers: {
      //  'HTTP_X_API_KEY': 'ShaktipeethAUTH@##@17$',
      //  'Content-Type': 'application/json',
      // },
      // body: JSON.stringify({
      //  booking_id: GLOBAL.booking_id,
      //  from:"priest"
      //
      // }),
      // }).then((response) => response.json())
      // .then((responseJson) => {
      //
      //
      // if (responseJson.status == true) {
      //   // this.props
      //   //     .navigation
      //   //     .dispatch(StackActions.reset({
      //   //         index: 0,
      //   //         actions: [
      //   //             NavigationActions.navigate({
      //   //                 routeName: 'DrawerNavigator',
      //   //                 params: { someParams: 'parameters goes here...' },
      //   //             }),
      //   //         ],
      //   //     }))
      // } else {
      // }
      // })
      // .catch((error) => {
      //
      // console.error(error);
      // });
    }

    switchCamera = () => {
        RtcEngine.switchCamera();
    }

    toggleAllRemoteAudioStreams = () => {
        this.setState({
            isMute: !this.state.isMute
        }, () => {
            RtcEngine.muteAllRemoteAudioStreams(this.state.isMute).then(_ => {
                /**
                 * ADD the code snippet after muteAllRemoteAudioStreams success.
                 */
            })
        })
    }

    toggleAllRemoteAudioStreamss = () => {
        this.setState({
            isMutes: !this.state.isMutes
        }, () => {
            RtcEngine.setEnableSpeakerphone(this.state.isMutes).then(_ => {
                /**
                 * ADD the code snippet after muteAllRemoteAudioStreams success.
                 */
            })
        })
    }

    toggleHideButtons = () => {
        this.setState({
            hideButton: !this.state.hideButton
        })
    }

    onPressVideo = (uid) => {
        this.setState({
            selectedUid: uid
        }, () => {
            this.setState({
                visible: true
            })
        })
    }
//setEnableSpeakerphone
    toolBar = ({hideButton, isMute}) => {
        if (!hideButton) {
            return (
                <View>
                    <View style={styles.bottomView}>



                        <OperateButton
                            onPress={this.toggleAllRemoteAudioStreams}
                            source={isMute ? IconMuted() : BtnMute()}
                        />

                        <OperateButton
                            onPress={this.switchCamera}
                            source={BtnSwitchCamera()}
                        />
                    </View>
                </View>)
        }
    }

    agoraPeerViews = ({visible, peerIds}) => {
        return (visible ?
            <View style={styles.videoView} /> :
            <View style={styles.videoView}>{
                peerIds.map((uid, key) => (
                    <TouchableOpacity
                        activeOpacity={1}

                        key={key}>
                        {/*               <Text>uid: {uid}</Text>*/}
                        <AgoraView
                            mode={1}
                            style={styles.remoteView}
                            zOrderMediaOverlay={true}
                            showLocalVideo={true}
                        />
                    </TouchableOpacity>
                ))
            }</View>)
    }

    selectedView = ({visible}) => {
        return (
            <Modal
                visible={visible}
                presentationStyle={'fullScreen'}
                animationType={'slide'}
                onRequestClose={() => {}}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={{flex: 1}}
                    onPress={() => this.setState({
                        visible: false
                    })} >
                    <AgoraView
                        mode={1}
                        style={{flex: 1}}
                        zOrderMediaOverlay={true}
                        remoteUid={this.state.selectedUid}
                    />
                </TouchableOpacity>
            </Modal>)
    }

    render () {
    //  alert(this.state.peerIds)
        if (!this.state.joinSucceed) {
            return (
                <View style={{flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator animating={this.state.animating} />
                </View>
            )
        }

         if (this.state.peerIds.length == 0){
          return (
              <View style={{flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center'}}>

              <Text style = {{color:'black',textAlign:'center',marginTop:30,fontSize:12}}>
              Connecting
              </Text>
              <LottieView source={require('./waiting.json')} autoPlay loop />


              </View>
          )
        }

        return (
            <Surface
                activeOpacity={1}
                onPress={this.toggleHideButtons}
                style={styles.container}
            >

              <AgoraView style={styles.localView} remoteUid={this.state.peerIds[0]}showLocalVideo={false} mode={1} />


                <View style = {styles.absViews}>


<View style = {{flexDirection:'row',width:window.width,height:80,marginLeft:12,justifyContent:'space-between',marginTop:6}}>

<View style = {{flexDirection:'row'}}>


<Image   source={{uri:GLOBAL.pimage}}
         style  = {{width:30, height:30,borderRadius:15,borderWidth:2,borderColor:'white'
       }}/>

         <View style = {{marginTop:1,height:30,marginLeft:-20}}>

         <View style = {{flexDirection:'row',width:window.width - 25 ,justifyContent:'space-between'}}>

         <Text style={{fontFamily:GLOBAL.heavy,fontSize:16,marginTop:2,color:'white',marginLeft:20,textAlign:'center'}}>
         ?? {GLOBAL.priest_name}

         </Text>


         <TouchableOpacity
         ?? ?? activeOpacity ={0.99} onPress= {()=>this.navigateToScreen1()}>

         <Image
             source={require('./close.png')}
             style={{width: 12, height: 12,margin:14,resizeMode:'contain'}}


         />
        </TouchableOpacity>
         </View>


<View style = {{flexDirection:'row',marginLeft:25,marginTop:-20}}>






<View style = {{flexDirection:'row',height:30}}>
<Image
    source={require('./clock.png')}
    style={{width: 10, height: 10,marginLeft:1,marginTop:5,resizeMode:'contain'}}


/>
<View style = {{marginTop:1,marginLeft:5}}>
<Stopwatch
?? ?? laps
?? ?? start={this.state.stopwatchStart}
?? ?? reset={this.state.stopwatchReset}
?? ?? options={options}
?? ?? getTime={this.getFormattedTime}
/>
</View>

<CountDown
       until={parseInt(GLOBAL.rtime)}
       onFinish={() => alert('finished')}
       digitStyle={{backgroundColor: '#FFF'}}
   digitTxtStyle={{color: '#1CC625'}}
   timeToShow={['M', 'S']}
   timeLabels={{m: 'MM', s: 'SS'}}
     />

</View>
</View>
</View>
</View>
</View>
</View>


                <View style={styles.absView}>
                    {/*      <Text>uid: {this.props.uid}, channelName: {this.props.channelName}, peers: {this.state.peerIds.join(",")}</Text>*/}
                    {this.agoraPeerViews(this.state)}

                    <View style={{flex:2,flexDirection:'row',backgroundColor:'transparent',width:window.width - 30,position:'absolute',bottom:10,height:250}}>
<View style = {{flexDirection:'row',width:window.width - 90}}>

                        </View>

                        <View style = {{position:'absolute',height:30,bottom:12,right:-20,marginLeft:60,flexDirection:'row'}}>


                          <TouchableOpacity
                          ?? ?? activeOpacity ={0.99} onPress= {()=>this.switchCamera()}>
                          <Image
                              source={require('./btn_switch_camera.png')}
                              style={{width: 40, height: 40,margin:5,marginLeft:28,resizeMode:'contain',alignSelf:'flex-end'}}


                          />
                          </TouchableOpacity>

                          <OperateButton
                              onPress={this.toggleAllRemoteAudioStreams}
                              source={this.state.isMute ? IconMuted() : BtnMute()}
                          />

                        </View>


                    </View>


                </View>
                {this.selectedView(this.state)}
            </Surface>
        )
    }
}

export default function AgoraRTCViewContainer(props) {
  const  navigation  = props.route.params
  //alert(JSON.stringify(props.route.params))

    const channelProfile = navigation.channelProfile
    const clientRole = navigation.clientRole
    const channelName = navigation.channelName
    const uid = navigation.uid
    const onCancel = navigation.onCancel

    return (<VideoCall
        channelProfile={channelProfile}
        channelName={channelName}
        clientRole={clientRole}
        uid={uid}
        onCancel={onCancel}
        {...props}
    ></VideoCall>)
}
