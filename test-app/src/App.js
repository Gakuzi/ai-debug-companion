import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { initLogger, logInfo, logError, logWarn, BlackBox } from 'ai-debug-companion-agent';
// Initialize the logger
initLogger({
    projectId: 'test-project',
    collectorUrl: 'http://localhost:3000/logs',
    level: 'DEBUG'
});
function App() {
    const [count, setCount] = useState(0);
    const handleTestLogs = () => {
        logInfo('Тестовое информационное сообщение');
        logWarn('Тестовое предупреждение');
        logError('Тестовая ошибка');
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("a", { href: "https://vitejs.dev", target: "_blank", children: _jsx("img", { src: viteLogo, className: "logo", alt: "Vite logo" }) }), _jsx("a", { href: "https://react.dev", target: "_blank", children: _jsx("img", { src: reactLogo, className: "logo react", alt: "React logo" }) })] }), _jsx("h1", { children: "Vite + React" }), _jsxs("div", { className: "card", children: [_jsxs("button", { onClick: () => setCount((count) => count + 1), children: ["count is ", count] }), _jsx("button", { onClick: handleTestLogs, children: "\u0422\u0435\u0441\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043B\u043E\u0433\u0438" }), _jsxs("p", { children: ["Edit ", _jsx("code", { children: "src/App.tsx" }), " and save to test HMR"] })] }), _jsx("p", { className: "read-the-docs", children: "Click on the Vite and React logos to learn more" }), _jsx(BlackBox, { projectId: "test-project" })] }));
}
export default App;
//# sourceMappingURL=App.js.map