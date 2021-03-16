import React, {Component} from 'react';
import { StyleSheet, Text, View, Button,Dimensions,Image,Animated,TouchableOpacity,Alert } from 'react-native';
import Backend from "./Backend.js";
import { GiftedChat } from "react-native-gifted-chat";
import ImagePicker from 'react-native-image-picker';
import Bubble from "react-native-gifted-chat/lib/Bubble";
import { EventRegister } from 'react-native-event-listeners';
import CountDown from 'react-native-countdown-component';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
var randomString = require('random-string');
const GLOBAL = require('./Global');
const window = Dimensions.get('window');
type Props = {};
const options = {
    title: 'Select Document',
    maxWidth:300,
    maxHeight:500,

    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
};
export default class MyChat extends Component<Props> {
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Chat Consulation',
            animations: {
                setRoot: {
                    waitForRender: false
                }
            }
        }
    }

    constructor(props) {
        super(props);


        this.state = {
            modalVisible: false,
            recognized: '',
            started: '',
            text :'',
            mystatus:false,
            results: [],
            messages: [],
            texts:'',

        };

    }



    UrgeWithPleasureComponent = () => (
     <CountdownCircleTimer
       isPlaying
       duration={parseInt(GLOBAL.rtime)}
       colors={[
         ['#004777', 0.4],
         ['#F7B801', 0.4],
         ['#A30000', 0.2],
       ]}
     >
       {({ remainingTime, animatedColor }) => (
         <Animated.Text style={{ color: animatedColor }}>
           {remainingTime}
         </Animated.Text>
       )}
     </CountdownCircleTimer>
   )

    // renderBubble(props) {
    //
    //     return (
    //         <View>
    //             <Text style={{color:'black'}}>{props.currentMessage.user.name}</Text>
    //         </View>
    //     );
    // }
    componentWillMount() {

      // const url = GLOBAL.BASE_URL +  'chat_read'
      //
      //                   fetch(url, {
      //                       method: 'POST',
      //                       headers: {
      //                           'Content-Type': 'application/json',
      //                       },
      //                       body: JSON.stringify({
      //                           user_id:GLOBAL.user_id,
      // chat_group_id:GLOBAL.bookingid
      //
      //
      //                       }),
      //                   }).then((response) => response.json())
      //                       .then((responseJson) => {
      //
      //                           if (responseJson.status == true) {
      //
      //
      //                           }else {
      //
      //
      //                           }
      //                       })
      //                       .catch((error) => {
      //                           console.error(error);
      //                       });

    }
    renderBubble = (props,index) => {
        var a = false;
        if (props.currentMessage.status == true){
        a = true;
        }else{
            a = false;
        }
        //
        // if (props.currentMessage.user_id != GLOBAL.user_id ){
        //
        // }
        return (

                <View style={{paddingRight: 12}}>




                    <Bubble {...props}
                    wrapperStyle={{
                                            left: {
                                                backgroundColor: '#e1e1e1',
                                            },
                                            right: {
                                                backgroundColor: '#639ced'
                                            }
                                        }} />
                    {props.currentMessage.user_id != GLOBAL.user_id  &&  (
                        <View>

                        </View>
                    )}

                    {props.currentMessage.user_id == GLOBAL.user_id  &&  (
                        <View>
                            {a == true && (

                                <Image style={{width:15, height:15, resizeMode:'contain', alignSelf:'flex-end'}}
                                source={require('../resources/seen.png')}/>

                            )}

                            {a != true && (

                                <Image style={{width:15, height:15, resizeMode:'contain', alignSelf:'flex-end'}}
                                source={require('../resources/unseen.png')}/>

                            )}

                        </View>
                    )}






                </View>

        )
    }



    showActionSheet= ()=>{
      ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                const source = { uri: response.uri };

                const url = 'http://139.59.67.166/shaktipeeth_website/admin/api/image_attchment_upload'
                const data = new FormData();
               
                 

                // you can append anyone.
                data.append('image', {
                    uri:response.uri,
                    type: 'image/jpeg', // or photo.type
                    name: 'image.png'
                });
                fetch(url, {
                    method: 'post',
                    body: data,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }

                }).then((response) => response.json())
                    .then((responseJson) => {
                        //       this.hideLoading()
                     
//alert(responseJson.path)
                       var x = randomString({
                                      length: 20,
                                      numeric: true,
                                      letters: true,
                                      special: false,
                                      exclude: ['a', 'b']
                                  });

                                  var array = [];
                                  var users = {
                                      _id: GLOBAL.user_id,
                                      name: GLOBAL.myname,
                                  }
                                  var today = new Date();
                                  /* today.setDate(today.getDate() - 30);
                                  var timestamp = new Date(today).toISOString(); */
                                  var timestamp = today.toISOString();
                                  var dict = {
                                      text: 'Attachment',
                                      user: users,
                                      createdAt: timestamp,
                                      _id: x,
                                      image: responseJson.path,

                                      // etc.
                                  };
                                  array.push(dict)
                                  //Backend.load()

console.log(responseJson.images)
                                  Backend.sendMessage(array)




                    }

                  );




                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };


            }
        });
    }





    renderActions=() =>{
        return(
            <TouchableOpacity onPress={()=>this.showActionSheet()}>
                <Image style={{width:22, height:22, resizeMode:'contain', marginLeft:9, marginBottom:12}}
                       source={require('../resources/attachement.png')}/>
            </TouchableOpacity>
        )
    }
    login = () => {
        this.props
            .navigation
            .dispatch(StackActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({
                        routeName: 'Landing',
                        params: { someParams: 'parameters goes here...' },
                    }),
                ],
            }))
    }

    renderChatFooter = () => {
      if (this.state.texts != ""){
        return  <Text style = {{fontSize:14,margin:10}}> {this.state.texts}</Text>;
      }

          // if (this.state.isTyping) {
          //   if (this.typingTimeoutTimer == null) {
          //     this.startTimer();
          //   }
          //   return <TypingIndicator />;
          // }
        return null;
      };
    render() {


        return (
      <View style = {{flex:1,backgroundColor:'#fcfcfe',width:window.width}}>

      <CountDown
             until={parseInt(GLOBAL.rtime)}
             onFinish={() => alert('finished')}
             digitStyle={{backgroundColor: '#FFF'}}
         digitTxtStyle={{color: '#1CC625'}}
         timeToShow={['M', 'S']}
         timeLabels={{m: 'MM', s: 'SS'}}
           />





            <GiftedChat
                    renderActions={this.renderActions}
                    extraData={this.state}
                    renderUsernameOnMessage = {true}
                    messages={this.state.messages}
            renderChatFooter={this.renderChatFooter}
                    onSend={message => {


    Backend.sendMessage(message);



                    }}
                    renderBubble={this.renderBubble}
                    onInputTextChanged = {text =>{
                        Backend.updateTyping(text)

                        // alert(text)

                    }

                    }
                    user={{
                        _id: GLOBAL.user_id,
                        name: "varun"
                    }}
                />
            </View>





        );
    }


    componentDidMount() {
      this.listener = EventRegister.addEventListener('pujaend', (data) => {
                this.props.navigation.goBack()
                })

      //  GLOBAL.mystatus = "Online";



        // Backend.updateMessage(message => {
        //     alert(JSON.stringify(message))
        //
        //
        // })


        Backend.loadMessages(message => {
          //  alert(JSON.stringify(message))

            if (message.text == ''){


                for (var i = 0; i< this.state.messages.length;i++){

                         //  if (this.state.messages[i].anotherid == GLOBAL.user_id) {


                               if (this.state.messages[i].status == false) {

                                   let {messages} = this.state;
                                   let targetPost = messages[i];

                                   // Flip the 'liked' property of the targetPost
                                   targetPost.status = true;

                                   // Then update targetPost in 'posts'
                                   // You probably don't need the following line.
                                   // posts[index] = targetPost;

                                   // Then reset the 'state.posts' property
                                   this.setState({messages});
                               }
                         //  }
                   // alert(JSON.stringify(this.state.messages))
                }

                                   this.setState({messages:this.state.messages});

                return {
                    messages: this.state.messages
                };
                       //  var a = this.state.messages[i]
                       //
                       //
                       //  a.status = true
                       //
                       // // this.setState({messages:a})
                  //  this.setState({messages:})
             //   }


            } else {

                this.setState(previousState => {


                    return {
                        messages: GiftedChat.append(previousState.messages, message)
                    };
                });
            }
        });


       ;

        // Backend.updateMessage(message => {
        //     alert(JSON.stringify(message))
        //
        //
        // })

        Backend.loadMessagess(message => {
          // alert(JSON.stringify(message.typinganother))
            if (message.typinganother == true){
                var s = message.name +  ' is typing ...'
                this.setState({texts:s})
            }else{
                this.setState({texts:''})
            }

        });
    }
    componentWillUnmount() {
        Backend.closeChat();
    }
}
const styles = StyleSheet.create({
    wrapper: {
    },
    container: {
        flex: 1,
        backgroundColor :'#001739'
    },
    slide1: {

        marginLeft : 50,

        width: window.width - 50,
        height:300,
        resizeMode:'contain',
        marginTop : window.height/2 - 200


    },
    loading: {
        position: 'absolute',
        left: window.width/2 - 30,

        top: window.height/2,

        opacity: 0.5,

        justifyContent: 'center',
        alignItems: 'center'
    },
    slide2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slide3: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#92BBD9',
    },
    text: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
    }
})
