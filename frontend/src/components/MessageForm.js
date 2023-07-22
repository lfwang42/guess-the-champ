import React from 'react'

export default function MessageForm() {
  return (
    <div>
        <div>
            <ul id='messages'></ul>
        </div>
        <div>
            <form id="form" action="">
                <input id="input" autoComplete="off" /><button>Send 123</button>
            </form>
        </div>
    </div>
  )
}
