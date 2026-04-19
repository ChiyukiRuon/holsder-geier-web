interface CheckProps {
    size?: number;
    color?: string;
}

const Check = ({ size = 20, color = "white" }: CheckProps) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             strokeWidth="1.5" stroke="currentColor"
             style={{
                 width: size,
                 height: size,
             }}
             color={color}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"/>
        </svg>
    )
}

export default Check
