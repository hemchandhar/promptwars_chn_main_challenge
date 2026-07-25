import logo from '../assets/logo.png';

export default function Logo({ height = 22, style }) {
  return <img src={logo} alt="careOcare" style={{ height, display: 'block', ...style }} />;
}
