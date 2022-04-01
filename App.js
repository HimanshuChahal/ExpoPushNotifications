import { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import axios from 'axios'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
})

const getExpoPushToken = async (setExpoPushToken) => {

  try
  {

    const permission = await Notifications.getPermissionsAsync()

    console.log(permission)

    if(permission.status !== 'granted')
    {
      console.log('Called')
      const askedPerm = await Notifications.requestPermissionsAsync()
      
      if(askedPerm.status !== 'granted')
      {
        console.log('Cannot get push token without permissions')

        return
      }

      const token = await Notifications.getExpoPushTokenAsync()

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      setExpoPushToken(token.data)

    } else
    {
      const token = await Notifications.getExpoPushTokenAsync()

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      setExpoPushToken(token.data)
    }

  } catch(e)
  {
    console.log('Get Expo Push Token', e)
  }

}

const App = () => {

  const [ expoPushToken, setExpoPushToken ] = useState('')
  const [ subscribed, setSubscribed ] = useState(false)
  const [ notification, setNotification ] = useState()
  const notificationReceivedListener = useRef()
  const notificationResponseListener = useRef()

  const sendNotificationWithToken = async () => {

    const data = {
      token: expoPushToken
    }

    try
    {

      await axios.post('http://localhost:3000/sendtoken', data)

      console.log('Send token success')

    } catch(e)
    {
      console.log('Send notification with token', e)
    }

  }

  useEffect(() => {

    getExpoPushToken(setExpoPushToken)

    notificationReceivedListener.current = Notifications.addNotificationReceivedListener(setNotification)
    notificationResponseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      setNotification(response.notification)
    })

    return () => {
      Notifications.removeNotificationSubscription(notificationReceivedListener.current)
      Notifications.removeNotificationSubscription(notificationResponseListener.current)
    }

  }, [])

  console.log(expoPushToken)

  return (
    <View style = {{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>

      <Text style = {{ color: 'black', fontSize: 20 }}>Push Notifications</Text>
      
      <TouchableOpacity style = {{ marginTop: 20, paddingVertical: 7, paddingHorizontal: 30, borderRadius: 10, backgroundColor: 'black' }}
      onPress = { sendNotificationWithToken }>

        <Text style = {{ color: 'white' }}>Send</Text>

      </TouchableOpacity>

    </View>
  )

}

export default App
