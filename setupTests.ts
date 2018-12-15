import * as Enzyme from 'enzyme';
const Adapter = require('enzyme-adapter-react-16');

// Configure Enzyme
Enzyme.configure({ adapter: new Adapter() });
