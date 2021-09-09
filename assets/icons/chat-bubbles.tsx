import {memo} from 'react';

function ChatBubbles() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.25 3.25V5.625H13.5V3.25C13.5 2.38805 13.1576 1.5614 12.5481 0.951903C11.9386 0.34241 11.112 0 10.25 0H3.25C2.38805 0 1.5614 0.34241 0.951903 0.951903C0.342411 1.5614 0 2.38804 0 3.25V11.25C0 12.16 0.548195 12.9805 1.38896 13.3287C2.22973 13.677 3.19749 13.4845 3.84099 12.841L5.18198 11.5H6.75V9.25H4.25L2.25 11.25V3.25C2.25 2.98478 2.35536 2.73043 2.54289 2.54289C2.73043 2.35536 2.98478 2.25 3.25 2.25H10.25C10.5152 2.25 10.7696 2.35536 10.9571 2.54289C11.1446 2.73043 11.25 2.98478 11.25 3.25Z" fill="#4250E4"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M16.5052 19.3287L15.3241 18H10.8889C10.0416 18 9.28416 17.6193 8.76553 17.0358C8.25372 16.46 8 15.7246 8 15V10C8 9.27542 8.25372 8.53995 8.76553 7.96417C9.28416 7.3807 10.0416 7 10.8889 7H17.1111C17.9584 7 18.7158 7.3807 19.2345 7.96417C19.7463 8.53995 20 9.27542 20 10V18C20 18.8304 19.4869 19.5743 18.7108 19.8694C17.9346 20.1645 17.0568 19.9493 16.5052 19.3287ZM18 10V18L16.2222 16H10.8889C10.6531 16 10.427 15.8946 10.2603 15.7071C10.0937 15.5196 10 15.2652 10 15V10C10 9.73478 10.0937 9.48043 10.2603 9.29289C10.427 9.10536 10.6531 9 10.8889 9H17.1111C17.3469 9 17.573 9.10536 17.7397 9.29289C17.9063 9.48043 18 9.73478 18 10Z" fill="#4250E4"/>
    </svg>
  )
}
export default memo(ChatBubbles);