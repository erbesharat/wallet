import { Schema } from 'shock-common'
import produce from 'immer'
import { Reducer } from 'redux'

import { Action } from '../app/actions'

type State = Record<string, Schema.InvoiceWhenDecoded>

const reducer: Reducer<State, Action> = (state = {}, action) =>
  produce(state, draft => {
    if (action.type === 'invoice/load') {
      const { payment_request, ...decodedInvoice } = action.data

      draft[payment_request] = decodedInvoice
    }
  })

export default reducer
