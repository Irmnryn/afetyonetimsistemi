import aidScene from '../assets/aid-scene.jpeg';

function AidAnimation() {
  return (
    <img
      src={aidScene}
      alt="Afet sonrası yardımlaşma görseli"
      className="aid-illustration block w-full rounded-[1.25rem] object-cover"
    />
  );
}

export default AidAnimation;
