import { useEffect } from "react";
import { useSelector } from "react-redux";

const ChatBox = () => {

    const { user } = useSelector(state => state.auth);

    useEffect(() => {

        const s1 = document.createElement("script");

        s1.async = true;

        s1.src = "https://embed.tawk.to/6a085a731358261c34fe883b/1jooa2lju";

        s1.charset = "UTF-8";

        s1.setAttribute("crossorigin", "*");

        document.body.appendChild(s1);

        window.Tawk_API = window.Tawk_API || {};

        window.Tawk_API.onLoad = function () {

            if(user){

                window.Tawk_API.setAttributes({
                    name: user.username,
                    email: user.email
                });

            }
        };

    }, [user]);

    return null;
};

export default ChatBox;