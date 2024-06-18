## Task 3 - redux-saga usage

> 雖然題目需求為 `.txt` 檔案，但還是改成 markdown 格式，方便在 GitHub 上閱讀。

### 1. Simply describe what `function1` will do.

`function1` 是一個 Redux Saga generator function 當他被執行時，會有以下行為：

- 設定該 POST 請求的資料及中止 signal
- 執行該 POST 請求並等待，若請求有順利完成，則會執行 reducer 1 中的相關邏輯
- 如果請求遇到錯誤，則會執行 reducer 2 中的相關邏輯
- 最後無論請求成功或失敗，檢查該請求結束的原因是否因為被 `ctrl` 主動中斷，若是，則會執行 reducer 3 中的相關邏輯

### 2. Can we stop what `function1` is doing? How?

可以透過 `function2` 來中斷 `function1` 的執行，因為 `function2` 會呼叫 `ctrl.abort()` 來中斷該請求。

### 3. How to optimize this snippet?

- `function1` 的邏輯可以再拆分出其他 function 來增加可讀性並減少 function1 的複雜度。
- 變數名稱或許可以更易讀一些，如 `function1` 與 `function2` 可以分別改為 `handleUpdateRequest`、`abortUpdateRequest`。
- 可以對 error handling 處理得更細緻，例如實作共用 error handler 模組，來處理各種 error type，並將非預期錯誤送到如 Sentry 等監測工具中方便偵錯。
- 可考慮將 AbortController 的 instantiation 移到 `function1` 外部並做成 singleton 的方式，避免在每次執行 `function1` 時都創建新的 instance，來避免不必要的記憶體使用。或至少在 `function1` 執行完成後釋放該 instance。
- 在呼叫 `function2` 前，可以先確認 `ctrl` 是否存在來避免錯誤。

綜合上述其中幾點可以調整如下：

```javascript
import { call, put } from 'redux-saga/effects';
import axios from 'axios';

const abortController = {
  controller: null,

  getController() {
    if (!this.controller) {
      this.controller = new AbortController();
    }
    return this.controller;
  },

  resetController() {
    this.controller = null;
  }
};

const createConfig = (actionPayload) => {
  const ctrl = abortController.getController();

  return {
    method: 'POST',
    url: 'https://some-endpoint-url.com',
    data: actionPayload,
    signal: ctrl.signal
  };
};

function* handleUpdateRequest(action) {
  const ctrl = abortController.getController();
  const config = createConfig(action.payload);

  try {
    const { data } = yield call(axios, config);

    yield put(/** reducer 1 */);
  } catch (e) {
    yield call(handleError, e);
  } finally {
    if (ctrl.signal.aborted) {
      yield put(/** reducer 3 */);
    }
    abortController.resetController();
  }
}

const handleError = function* (error) {
  if (error.response) {
    yield put(/** reducer 2 */);
  } else {
    // handle unexpected errors with Sentry or other monitoring tool
  }
};

const abortUpdateRequest = () => {
  const ctrl = abortController.getController();

  if (ctrl) {
    ctrl.abort();
  }
};
```

其他若時間允許也能漸進式做工具替換的優化：

- 可考慮改為 TypeScript 補上型別，以提高程式碼的可維護性並避免 runtime error。
- 如果是技術選型考量，也可以考慮使用 Zustand 或 Tanstack Query 等狀態管理工具，尤其是後者更適合自動化地處理 server state 的管理與 cache 處理。
