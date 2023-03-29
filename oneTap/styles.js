import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    notificationPanel: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        borderColor: '#999',
        borderWidth: 1,
    },
    notificationTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
    },
    status: {
        fontSize: 14,
    },
});

export default styles;
