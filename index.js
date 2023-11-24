import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { router } from './route.js'
import { addUser, findUser, getRoomUsers, removeUser } from './users.js'

const app = express()

app.use(cors({ origin: '*' }))
app.use(router)

const server = http.createServer(app)

const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
})

io.on('connection', (socket) => {
	socket.on('join', ({ name, room }) => {
		socket.join(room)

		const { user, isExist } = addUser({ name, room })

		const userMessage = isExist
			? `Welcome back, ${user.name}`
			: `Hey ${user.name}`

		socket.emit('message', {
			data: { user: { name: 'Admin' }, message: userMessage },
		})

		socket.broadcast.to(user.room).emit('message', {
			data: { user: { name: 'Admin' }, message: `${user.name} has joined` },
		})

		io.to(user.room).emit('room', {
			data: { users: getRoomUsers(user.room) },
		})
	})

	socket.on('sendMessage', ({ message, params }) => {
		const user = findUser(params)

		if (user) {
			io.to(user.room).emit('message', { data: { user, message } })
		}
	})

	socket.on('leftRoom', ({ params }) => {
		const user = removeUser(params)

		if (user) {
			const { room, name } = user
			io.to(room).emit('message', {
				data: { user: { name: 'Admin' }, message: `${name} has left room` },
			})

			io.to(room).emit('room', {
				data: { users: getRoomUsers(room) },
			})
		}
	})

	io.on('disconnect', () => {
		console.log('disconnect')
	})
})

server.listen(5000, () => {
	console.log('server is running')
})
