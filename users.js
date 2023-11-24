import { trimString } from './utils.js'

let users = []

export const findUser = (user) => {
	const userName = trimString(user.name)
	const userRoom = trimString(user.room)

	return users.find(
		(user) =>
			trimString(user.name) === userName && trimString(user.room) === userRoom
	)
}

export const addUser = (user) => {
	const isExist = findUser(user)

	!isExist && users.push(user)

	const currentUser = isExist || user

	return { isExist: !!isExist, user: currentUser }
}

export const getRoomUsers = (room) => users.filter(( user ) => user.room === room)

export const removeUser = (user) => {
	const found = findUser(user)

	if(found) {
		users.filter(({ room, name }) => room === found.room && name !== found.name)
	}

	users = users.filter(u => u.room === found.room && u.name !== found.name || u.room !== found.room)

	return found
}
