import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import Image from 'react-native-remote-svg';
import { Container, Content, Footer, Left, Body, Right, Spinner } from 'native-base';
import { connect } from 'react-redux';
import { UIActivityIndicator } from 'react-native-indicators'
import { IconsMap } from 'assets/assetMap';
import { setVisibleIndicator, insertFeedbackAction } from '../../actions/auth'
import AppBarComponent from '../../components/AppBar/appbar.index';

class Feedback extends Component {
    static navigationOptions = {
        header: null
    };
    constructor() {
        super();
        this.state = {
            feedbackText: '',
            animating: false
        }
    }
    componentWillReceiveProps(nextProps) {
        // if (!this.mount) return

        // let { indicatorShow } = nextProps

        // if (indicatorShow != this.state.animating) {
        //     this.setState({
        //         animating: indicatorShow,
        //     });
        // }

        if (nextProps.feedbackInsereted !== null) {
            var feedbackInsereted = nextProps.feedbackInsereted

            //this.showIndicator(false)

            if (feedbackInsereted) {
                // const { navigate } = this.props.navigation;
                // navigate('NearbyEvents')
                Alert.alert(
                    'Thanks for your feedback!',
                    'We will take a look at it as soon as we can',
                    [
                        { text: 'Return to menu', onPress: () => this.props.navigation.goBack() },
                    ],
                    { cancelable: false }
                )
            } else {
            }

            //this.props.onClearCreate()
        }
    }

    render() {
        return (
            <Container style={{ backgroundColor: '#ffffff' }}>
                <AppBarComponent />
                <Content>
                    <View style={{ padding: 15 }}>
                        <Text style={styles.textStyle} >
                            Hey, you downloaded the hoozin app! We’re happy you’re trying
                            out our app and we’re also pretty open to feedback here at
                            hoozin. We are always interested in getting user input so
                            that we can make this product better. Please keep in mind that
                            this is out beta release. We have a lot of features and ideas
                            we plan on adding in the future, so go easy on us. We will
                            review your message and see if it will make sense in our product
                            roadmap. If you would like, leave your email address and we will
                            try our best to respond.
                    </Text>
                    </View>
                    <View style={{ padding: 15 }}>
                        <TextInput
                            multiline={true}
                            placeholder="Just start typing away here"
                            numberOfLines={6}
                            value={this.state.feedbackText}
                            onChangeText={(text) => this.onFeedbackTextChange(text)}
                            underlineColorAndroid="#CECECE"
                        />
                        <View style={{ borderBottomColor: '#cecece', borderBottomWidth: 2, paddingTop: 10 }} ></View>
                    </View>
                    <View style={{ paddingTop: 200 }}></View>
                </Content>
                {this.state.animating &&
                    <View style={styles.overlay}>
                        <Spinner color={'lightgoldenrodyellow'} style={styles.spinner} />
                    </View>
                }
                <Footer style={styles.bottomView}>
                    <Left>
                        <TouchableOpacity 
                            onPress={() => this.props.navigation.navigate({
                                routeName: 'EventList',
                                key: 'EventList',
                            })}
                            style={styles.fabLeftWrapperStyles}
                            >
                            <Image source={IconsMap.icon_list_circle} style={styles.fabStyles} />
                        </TouchableOpacity>
                    </Left>
                    <Body>
                        <TouchableOpacity 
                            style={{ position: 'absolute', left: 30 }} 
                            onPress={() => this.onConfirmFeedBack()}
                            >
                            <Image source={IconsMap.icon_success} style={styles.fabStyles} />
                        </TouchableOpacity>
                    </Body>
                    <Right></Right>
                </Footer>
            </Container>
        );
    }

    onConfirmFeedBack() {
        let email = this.props.user.email
        let uid = this.props.user.socialUID
        let feedbackText = this.state.feedbackText
        let timestamp = new Date();
        if (feedbackText) {
            //this.props.onShowIndicator(true)
            this.props.insertFeedback(email, feedbackText, uid, timestamp);
        } else {
            Alert.alert('Please write something in feedback')
        }
    }

    onFeedbackTextChange(text) {
        this.setState({ feedbackText: text });
    }

    onMenuPressed() {
        this.props.navigation.navigate({
            routeName: 'Menu',
            key: 'Menu',
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    bottomView: {
        height: 50,
        backgroundColor: 'transparent',
        borderTopWidth: 0
    },
    bottomBtn: {
        marginRight: 90,
    },
    tabBarView: {
        height: 45,
        flexDirection: 'row',
        paddingTop: 5,
    },
    avatarView: {
        flex: 1,
        alignItems: 'center',
    },
    dataView: {
        marginLeft: 20,
        marginRight: 20,
        flex: 2,
        flexDirection: 'column',
    },

    line: {
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
    },
    textStyle: {
        fontFamily: 'Lato',
        fontSize: 14,
        paddingBottom: 20,
        color: '#004D9B'
    },
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)'
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabLeftWrapperStyles: {
        position: 'absolute',
        bottom: -30,
        left: 20
      },
      fabRightWrapperStyles: {
        position: 'absolute',
        bottom: -30,
        right: 20
      },
      fabStyles: {
        width: 60,
        height: 60
      }
});

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.auth.user,
        feedbackInsereted: state.auth.feedbackInsereted,
        indicatorShow: state.auth.indicatorShow,
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        insertFeedback: (email, feedbackText, uid, timestamp) => { dispatch(insertFeedbackAction(email, feedbackText, uid, timestamp)) },
        onShowIndicator: (bShow) => { dispatch(setVisibleIndicator(bShow)) },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Feedback);
