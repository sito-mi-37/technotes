import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import {apiSlice} from "../../app/api/apiSlice"

const usersAdapter = createEntityAdapter({})

const initialState = usersAdapter.getInitialState()

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: builder =>({
        getUsers: builder.query({
            query: () => '/users',
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
            transformResponse: responseData => {
                const loadedUsers = responseData.map(user => {
                    user.id = user._id
                    return user
                })
                return usersAdapter.setAll(initialState, loadedUsers)
            },
            providesTags: (result, error, arg) => {
                if(result?.id){
                    return [
                        {type: 'User', id: 'LIST'},
                        ...result.ids.map(id => ({type: 'User', id}))
                    ]
                }else return [{type: 'User', id: 'LIST'}]
            }
        }),
        addNewUser: builder.mutation({
            query: initialData => ({
                url: '/users',
                method: 'POST',
                body: {
                    ...initialData
                }
            }),
            invalidatesTags:[
                {type: 'User', id: 'LIST'}
            ]
        }),
        updateUser: builder.mutation({
            query: initialData => ({
                url: '/users',
                method: 'PATCH',
                body: {
                    ...initialData
                }
            }),
            invalidatesTags:(result, error, arg) => [
                {type: 'User', id: arg.id }
            ]
        }),
        deleteUser: builder.mutation({
            query: ({id}) => ({
                url: '/users',
                method: 'DELETE',
                body: {id}

            }),
            invalidatesTags: (result, error, arg) => [
                {type: 'User', id: arg.id}
            ]
        })
    })
})

export const {
    useGetUsersQuery,
    useAddNewUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation 
} = usersApiSlice

export const selectUsersResult = usersApiSlice.endpoints.getUsers.select()

// create memoised selector
const selectUsersData = createSelector(
    selectUsersResult,
    usersResult => usersResult.data // normalized state object with ids and entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllUsers,
    selectById: selectUserById,
    selectsIds: selectUserIds
    //pass in a selector that returns the users slice of state
} = usersAdapter.getSelectors(state => selectUsersData(state) ?? initialState)