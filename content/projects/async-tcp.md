---
layout: project
title: Async Tcp Socket Server/Client in C#
date: 2018-04-17 22:15:00 +01:00
modify_date: 2018-04-18 12:50:00 +01:00
tags: asynch socket tcp server client c#
category: project
---

I wanted to program a server which can handle alot of clients at the same time just like [MMORP](https://de.wikipedia.org/wiki/Massively_Multiplayer_Online_Role-Playing_Game)-Servers do.

Many Languages are capable of doing this, but most of them are optimized for Web-Servers.  
Another important aspect is the amount of data being sent over the stream. There shouldn't be any limit for the package size.

## Code

Enough talking. Here are the complete codeblocks for each client- and serverside.  
I implemented a little bit more code than above in the tutorial, but everything should be well explained in the comments.  
Feel free to use this code and maybe program your own little MMORPG software.

[Click here](https://github.com/scriptworld-git/Async-Socket-TCP) to see the GitHub repository.

### Client

```csharp
public class ATclient
    {
        public static int BUFFER_SIZE = 1024;
        public static int PACKAGE_LENGTH_SIZE = 4;

        private Socket clientSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

        private string ip;
        private int port;

        //synchronize connected attribute
        private static Object Lock = new Object();
        private bool _connected = false;
        public bool connected
        {
            get
            {
                lock (Lock)
                {
                    return _connected;
                }
            }
            set
            {
                lock (Lock)
                {
                    _connected = value;
                }

                if(value == false){
                    //fire disconnect event
                    disconnecting?.Invoke();
                }
            }
        }

        //disconnecing event
        public delegate void standardHandler();
        public event standardHandler disconnecting;

        //events for logging messages
        public delegate void consoleLog(string message);
        public event consoleLog consoleLogging;

        #region Connect
        public void connect(string ip = "127.0.0.1", int port = 5000)
        {
            this.ip = ip;
            this.port = port;

            log("Connecting to server...");

            try
            {
                clientSocket.BeginConnect(ip, port, new AsyncCallback(connectCallback), clientSocket);
            }
            catch
            {
                connected = false;

                log("Failed to connect to Server.");
            }

            log($"Client set up to communicate with Server {ip} with Port {port}");
        }
        #endregion

        #region Recieve
        private void connectCallback(IAsyncResult ar)
        {
            try
            {
                Socket tempS = ar.AsyncState as Socket;
                tempS.EndConnect(ar);

                log("Connected.");
                connected = true;

                packageState package = new packageState(tempS);

                tempS.BeginReceive(package.sizeBuffer, 0, package.sizeBuffer.Length, SocketFlags.None, new AsyncCallback(recieveCallback), package);
            }
            catch
            {
                connected = false;
                log("Failed to connect to Server.");
            }
        }

        private void recieveCallback(IAsyncResult ar)
        {
            try
            {
                packageState package = ar.AsyncState as packageState;
                Socket clientS = package.socket;

                int bytesRead = clientS.EndReceive(ar);

                if (bytesRead > 0)
                {
                    int size = ATclient.BUFFER_SIZE;
                    if (package.readOffset == -1)
                    //got new package
                    {
                        size = BitConverter.ToInt32(package.sizeBuffer, 0);
                        package.readBuffer = new byte[size];
                        package.readOffset = 0;

                    }
                    else
                    //recieved data belongs to old package
                    {
                        package.readOffset += bytesRead;

                        if (package.readOffset == package.readBuffer.Length)
                        //all data for this package is read
                        {
                            //clone array so the package can be disposed
                            byte[] temp = package.readBuffer.Clone() as byte[];

                            //TODO IMPLEMENT
                            //TEMP IS THE RECIEVED DATA
                            //HANDLE DATA HERE

                            //free memory
                            package.Dispose();
                            package = new packageState(clientS);
                        }
                    }

                    if (package.readBuffer == null)
                    //new package
                    {
                        package.socket.BeginReceive(package.sizeBuffer, 0, package.sizeBuffer.Length, SocketFlags.None, new AsyncCallback(recieveCallback), package);
                    }
                    else
                    //read max buffer size or rest of the package size
                    {
                        int readsize = (ATclient.BUFFER_SIZE > size) ? size : ATclient.BUFFER_SIZE;
                        package.socket.BeginReceive(package.readBuffer, package.readOffset, readsize, SocketFlags.None, new AsyncCallback(recieveCallback), package);
                    }
                }
                else
                {
                    connected = false;
                    log("Error recieving Message! ReadBytes < 0.");
                }
            }
            catch
            {
                connected = false;
                log("Error recieving Message!");
            }
        }
        #endregion

        #region Send
        public void sendData(byte[] data)
        {
            if (connected)
            {
                try
                {
                    //send sizeinfo
                    byte[] sizeInfo = BitConverter.GetBytes(data.Length);
                    clientSocket.BeginSend(sizeInfo, 0, sizeInfo.Length, SocketFlags.None, new AsyncCallback(sendCallback), clientSocket);

                    //send data
                    clientSocket.BeginSend(data, 0, data.Length, SocketFlags.None, new AsyncCallback(sendCallback), clientSocket);
                }
                catch
                {
                    connected = false;
                }
            }
            else
            {
                log("Can't send Data. You are not connected to the Server.");
            }
        }

        private void sendCallback(IAsyncResult ar)
        {
            try
            {
                Socket clientS = ar.AsyncState as Socket;
                int sizeSend = clientS.EndSend(ar);

                log($"Sent {sizeSend} Bytes to the Server.");
            }
            catch
            {
                connected = false;
                log("Failed sending Message!");
            }
        }
        #endregion

        internal void log(string message)
        {
            consoleLogging?.Invoke(message);
        }
    }

    internal class packageState : IDisposable
    {
        public Socket socket = null;
        public byte[] sizeBuffer = new byte[ATclient.PACKAGE_LENGTH_SIZE];
        public int readOffset = -1;
        public byte[] readBuffer = null;

        public packageState(Socket s)
        {
            this.socket = s;
        }

        #region IDisposable Support
        //free memory
        private bool disposedValue = false;
        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    socket = null;
                    sizeBuffer = null;
                    readBuffer = null;
                }

                disposedValue = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
        #endregion
    }
```

### Server

```csharp
    public class ATserver
    {
        public static int MAX_PENDING_CONNECTIONS = 20;
        public static int MAX_CLIENTS = 1000;

        public static int BUFFER_SIZE = 1024;
        public static int PACKAGE_LENGTH_SIZE = 4;

        private Socket serverSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

        private List<client> clients = new List<client>();

        //public events
        public event clientHandler clientConnecting;
        public event clientHandler clientDisconnecting;
        public delegate void clientHandler(int clientID);

        //log events
        public event stringHandler consoleLogged;
        public delegate void stringHandler(string message);

        //recieving data handler
        public delegate void clientByteHandler(int clientID, byte[] data);

        #region Connect
        public void start(int port = 5000)
        {
            serverSocket.Bind(new IPEndPoint(IPAddress.Any, port));
            serverSocket.Listen(ATserver.MAX_PENDING_CONNECTIONS);
            serverSocket.BeginAccept(new AsyncCallback(acceptCallback), serverSocket);

            log($"Server listening on Port: {port}");
        }

        private void acceptCallback(IAsyncResult ar)
        {
            try
            {
                Socket serverS = ar.AsyncState as Socket;

                Socket clientSocket = serverS.EndAccept(ar);
                serverS.BeginAccept(new AsyncCallback(acceptCallback), serverS);

                log($"Connection from {clientSocket.RemoteEndPoint.ToString()} recieved.");

                if (clients.Count < ATserver.MAX_CLIENTS)
                {
                    client c = new client(clientSocket);
                    clients.Add(c);

                    //connect all the events from the client
                    c.clientDisconnecting += clientDisconnected;
                    c.recievingData += recievedData;
                    c.consoleLogging += log;

                    //start the client
                    c.startClient();
                    //fire the event that a client is connected
                    clientConnecting?.Invoke(c.id);
                }
                else
                {
                    clientSocket.Close();
                    log($"Max Number of Clients connected is reached. IP: {clientSocket.RemoteEndPoint.ToString()} got declined.");
                }
            }
            catch
            {
                log("Error accepting connection!");
            }
        }

        private void clientDisconnected(int clientID)
        {
            client client = clients.Find(x => x.id == clientID);

            if (client != null)
            {
                clientDisconnecting?.Invoke(clientID);

                clients.Remove(client);

                client.clientDisconnecting -= clientDisconnected;
                client.recievingData -= recievedData;
                client.consoleLogging -= log;
            }
        }

        private void recievedData(int clientID, byte[] data)
        {
            //TODO HANDLE DATA FROM THE CLIENT
        }
        #endregion

        #region Send
        public void sendDataTo(int id, byte[] data)
        {
            client c = clients.Find(x => x.id == id);

            if (c != null)
            {
                c.sendData(data);
            }
            else
            {
                log($"Couldn't find client with ID: {id}");
            }
        }
        #endregion

        internal void log(string message)
        {
            consoleLogged?.Invoke(message);
        }
    }

    internal class client
    {
        public int id;
        private static List<int> idList = new List<int>();

        private Socket socket = null;

        public event clientByteHandler recievingData;
        public event clientHandler clientDisconnecting;
        public event stringHandler consoleLogging;

        public client(Socket s)
        {
            id = 0;

            while (idList.Contains(id))
            {
                id++;
            }

            this.socket = s;
        }

        #region Setup
        public void startClient()
        {
            packageState package = new packageState(this.socket);

            socket.BeginReceive(package.sizeBuffer, 0, package.sizeBuffer.Length, SocketFlags.None, new AsyncCallback(recieveCallback), package);

            log($"Client: {id} is set up.");
        }

        private void recieveCallback(IAsyncResult ar)
        {
            log($"Data from Client: {id} recieved.");

            try
            {
                packageState package = ar.AsyncState as packageState;
                Socket clientS = package.socket;

                int bytesRead = clientS.EndReceive(ar);

                if (bytesRead > 0)
                {
                    int size = ATserver.BUFFER_SIZE;
                    if (package.readOffset == -1)
                    //new package
                    {
                        size = BitConverter.ToInt32(package.sizeBuffer, 0);
                        package.readBuffer = new byte[size];
                        package.readOffset = 0;
                    }
                    else
                    //add data to existing package
                    {
                        package.readOffset += bytesRead;

                        if (package.readOffset == package.readBuffer.Length)
                        //package fully read
                        {
                            //clone array so the package can be disposed
                            byte[] temp = package.readBuffer.Clone() as byte[];

                            //invoke the event
                            //temp is the recieved data!
                            recievingData?.Invoke(this.id, temp);

                            //free memory
                            package.Dispose();
                            package = new packageState(clientS);
                        }
                    }

                    if (package.readBuffer == null)
                    //new package
                    {
                        package.socket.BeginReceive(package.sizeBuffer, 0, package.sizeBuffer.Length, SocketFlags.None, new AsyncCallback(recieveCallback), package);
                    }
                    else
                    //read rest of the bytelength
                    {
                        int readsize = (ATserver.BUFFER_SIZE > size) ? size : ATserver.BUFFER_SIZE;
                        package.socket.BeginReceive(package.readBuffer, package.readOffset, readsize, SocketFlags.None, new AsyncCallback(recieveCallback), package);
                    }
                }
                else
                {
                    log("Error recieving Message! ReadBytes < 0.");
                    closeClient();
                }
            }
            catch
            {
                log("Error recieving Message!");
                closeClient();
            }
        }

        private void closeClient()
        {
            log($"Connection from {socket.RemoteEndPoint.ToString()} has been terminated. Client-ID: {id}");

            socket.Close();

            //Client Disconnected
            clientDisconnecting(this.id);
        }
        #endregion

        #region Send / Recieve Data

        public void sendData(byte[] data)
        {
            try
            {
                //send sizeinfo
                byte[] sizeInfo = BitConverter.GetBytes(data.Length);
                this.socket.BeginSend(sizeInfo, 0, sizeInfo.Length, SocketFlags.None, new AsyncCallback(sendCallback), this.socket);

                //send data
                this.socket.BeginSend(data, 0, data.Length, SocketFlags.None, new AsyncCallback(sendCallback), this.socket);
            }
            catch
            {
                log("Error sending Message to the Client: " + this.id);
                closeClient();
            }
        }

        private void sendCallback(IAsyncResult ar)
        {
            try
            {
                Socket clientS = ar.AsyncState as Socket;
                int sizeSend = clientS.EndSend(ar);

                log($"Sent {sizeSend} Bytes to the Server.");
            }
            catch
            {
                log("Failed sending Message!");
                closeClient();
            }
        }
        #endregion

        private void log(string message)
        {
            consoleLogging?.Invoke(message);
        }
    }

    internal class packageState : IDisposable
    {
        public Socket socket = null;
        public byte[] sizeBuffer = new byte[ATserver.PACKAGE_LENGTH_SIZE];
        public int readOffset = -1;
        public byte[] readBuffer = null;

        public packageState(Socket s)
        {
            this.socket = s;
        }

        #region IDisposable Support
        //free memory
        private bool disposedValue = false;
        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    socket = null;
                    sizeBuffer = null;
                    readBuffer = null;
                }

                disposedValue = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
        #endregion
    }
```
