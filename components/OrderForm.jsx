import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { BsFillLockFill } from 'react-icons/bs';
import districtsData from '../utils/districts.json';
import OrderSuccessModal from './OrderSuccessModal';
import { trackEvent, trackFormField } from '@/utils/tracking'; // Add this import

const productVariants = {
  pink: [
    {
      id: '1-pink',
      name: '1 Pcs Gluta Collagen Pink',
      price: 1390,
      save: null,
      image: '/assets/single.avif',
      quantity: 1,
    },
    {
      id: '2-pink',
      name: '2 Pcs Gluta Collagen Pink',
      price: 2700,
      save: '80',
      image: '/assets/double.avif',
      quantity: 2,
    },
    {
      id: '3-pink',
      name: '3 Pcs Gluta Collagen Pink',
      price: 3900,
      save: '270',
      image: '/assets/triple.avif',
      quantity: 3,
    },
  ],
  // plus: [
  //   {
  //     id: '1-plus',
  //     name: '1 Pcs Gluta Collagen +',
  //     price: 1390,
  //     image: '/assets/single-plus.avif',
  //   },
  //   {
  //     id: '2-plus',
  //     name: '2 Pcs Gluta Collagen +',
  //     price: 2700,
  //     image: '/assets/double-plus.avif',
  //   },
  //   {
  //     id: '3-plus',
  //     name: '3 Pcs Gluta Collagen +',
  //     price: 3900,
  //     image: '/assets/triple-plus.avif',
  //   },
  // ],
  // red: [
  //   {
  //     id: '1-red',
  //     name: '1 Pcs Red C Multivitamin',
  //     price: 1390,
  //     image: '/assets/single-red.avif',
  //   },
  //   {
  //     id: '2-red',
  //     name: '2 Pcs Red C Multivitamin',
  //     price: 2700,
  //     image: '/assets/double-red.avif',
  //   },
  //   {
  //     id: '3-red',
  //     name: '3 Pcs Red C Multivitamin',
  //     price: 3900,
  //     image: '/assets/triple-red.avif',
  //   },
  // ],
};

const OrderForm = () => {
  const [selectedProductType, setSelectedProductType] = useState('pink');
  const [selectedProductId, setSelectedProductId] = useState(
    productVariants.pink[0].id
  );
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    district: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredDistricts, setFilteredDistricts] = useState(
    districtsData.districts
  );
  const [shippingCharge, setShippingCharge] = useState(120);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [formStarted, setFormStarted] = useState(false); // Track if form has started

  const currentProducts = productVariants[selectedProductType];
  const selectedProduct = currentProducts.find(
    (p) => p.id === selectedProductId
  );
  const subtotal = selectedProduct ? selectedProduct.price : 0;
  const grandTotal = subtotal + shippingCharge;

  useEffect(() => {
    if (
      formData.district.includes('Dhaka') ||
      formData.district.includes('ঢাকা')
    ) {
      setShippingCharge(60);
    } else {
      setShippingCharge(120);
    }
  }, [formData.district]);

  useEffect(() => {
    setSelectedProductId(currentProducts[0].id);
  }, [selectedProductType]);

  // Track form start on first field interaction
  useEffect(() => {
    if (
      !formStarted &&
      (formData.fullName ||
        formData.phoneNumber ||
        formData.district ||
        formData.address)
    ) {
      trackEvent('form_start');
      setFormStarted(true);
    }
  }, [formData, formStarted]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'সম্পূর্ণ নামটি লিখুন';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'ফোন নাম্বার টি লিখুন';
    if (formData.phoneNumber && formData.phoneNumber.length < 13)
      newErrors.phoneNumber = 'ফোন নাম্বারটি সঠিক নয়.';
    if (!formData.district.trim()) newErrors.district = 'জেলা সিলেক্ট করুন';
    if (!formData.address.trim()) newErrors.address = 'ঠিকানা টি লিখুন';
    else if (formData.address.length < 5)
      newErrors.address =
        'ঠিকানাটি পরিপূর্ণ নয়। দয়া করে শহর, থানা উল্লেখ করুন';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    const orderPayload = {
      orderId: 'ORD-' + Date.now(),
      selectedProduct: selectedProduct.name,
      totalPrice: subtotal,
      shippingCharge,
      grandTotal,
      billingDetails: formData,
    };

    // Track purchase with all data
    trackEvent('purchase', {
      value: grandTotal,
      currency: 'BDT',
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity: selectedProductId.includes('1')
        ? 1
        : selectedProductId.includes('2')
        ? 2
        : 3,
      customer_name: formData.fullName,
      customer_phone: formData.phoneNumber,
      customer_district: formData.district,
      customer_address: formData.address,
    });

    console.log('Submitting Order:', orderPayload);

    setTimeout(() => {
      setIsLoading(false);
      setOrderDetails(orderPayload);
      setShowModal(true);
      console.log('Order Submitted Successfully!');
      console.log('Order Data:', JSON.stringify(orderPayload, null, 2));
    }, 1500);
  };

  // Track product tab selection
  const handleProductTypeChange = (type) => {
    setSelectedProductType(type);
    trackEvent('product_select', { product_type: type });
  };

  // Track name field
  const handleNameChange = (e) => {
    setFormData({ ...formData, fullName: e.target.value });
    if (e.target.value.trim()) {
      trackFormField('fullName');
    }
  };

  // Track phone field
  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phoneNumber: value });
    if (value) {
      trackFormField('phoneNumber');
    }
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, district: value });
    if (value.trim()) {
      trackFormField('district');
    }
    const filtered = districtsData.districts.filter(
      (d) =>
        d.name.toLowerCase().includes(value.toLowerCase()) ||
        d.bn_name.includes(value)
    );
    setFilteredDistricts(filtered);
    setIsDropdownOpen(true);
  };

  const handleDistrictSelect = (districtName) => {
    setFormData({ ...formData, district: districtName });
    setIsDropdownOpen(false);
    validateForm();
    trackFormField('district'); // Ensure tracked on select
  };

  // Track address field
  const handleAddressChange = (e) => {
    setFormData({ ...formData, address: e.target.value });
    if (e.target.value.trim()) {
      trackFormField('address');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ fullName: '', phoneNumber: '', district: '', address: '' });
    setSelectedProductType('pink');
    setErrors({});
    setFormStarted(false); // Reset for next session
  };

  return (
    <div id='order_form' className='py-12 px-4 md:px-8'>
      <div className='container mx-auto max-w-5xl'>
        {/* Top Header */}
        <div className='bg-pink-500 text-white text-center py-2 mb-8 rounded-lg shadow-md'>
          <p className='font-bold text-lg md:text-xl'>
            ফোনে অর্ডার করুন <a href='tel:+8801794855675'>01794855675</a>
          </p>
          <p className='text-md md:text-lg'>
            অর্ডার করতে নিচের ফরমটি সঠিক ভাবে পূরন করুন!
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* Main Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='order-2 md:order-1 p-6 bg-white rounded-lg border border-pink-400'>
              <h3 className='text-xl md:text-2xl font-bold mb-6 text-pink-700'>
                আপনার তথ্য
              </h3>
              <div className='space-y-6'>
                {/* Full Name */}
                <div>
                  <label
                    htmlFor='fullName'
                    className='block text-sm font-medium text-gray-700'
                  >
                    আগ্রহী নাম *
                  </label>
                  <input
                    type='text'
                    id='fullName'
                    name='fullName'
                    value={formData.fullName}
                    onChange={handleNameChange} // Updated
                    onBlur={() => validateForm()}
                    className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='আপনার পুরো নাম লিখুন'
                  />
                  {errors.fullName && (
                    <p className='text-red-500 text-xs mt-1'>
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor='phoneNumber'
                    className='block text-sm font-medium text-gray-700'
                  >
                    আপনার নাম্বার *
                  </label>
                  <PhoneInput
                    id='phoneNumber'
                    defaultCountry='BD'
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange} // Updated
                    onBlur={() => validateForm()}
                    className={`mt-1 block w-full phone-input-container outline-0 border py-3 px-4 rounded-lg ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='আপনার মোবাইল নাম্বার দিন'
                  />
                  {errors.phoneNumber && (
                    <p className='text-red-500 text-xs mt-1'>
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* District */}
                <div className='relative'>
                  <label
                    htmlFor='district'
                    className='block text-sm font-medium text-gray-700'
                  >
                    জেলা *
                  </label>
                  <input
                    type='text'
                    id='district'
                    name='district'
                    value={formData.district}
                    onChange={handleDistrictChange} // Updated
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() =>
                      setTimeout(() => setIsDropdownOpen(false), 200)
                    }
                    className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm ${
                      errors.district ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='আপনার জেলা নির্বাচন করুন'
                  />
                  {isDropdownOpen && (
                    <ul className='absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto'>
                      {filteredDistricts.map((district) => (
                        <li
                          key={district.id}
                          onMouseDown={() =>
                            handleDistrictSelect(district.name)
                          }
                          className='px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm'
                        >
                          {district.bn_name} ({district.name})
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.district && (
                    <p className='text-red-500 text-xs mt-1'>
                      {errors.district}
                    </p>
                  )}
                </div>

                {/* Full Address */}
                <div>
                  <label
                    htmlFor='address'
                    className='block text-sm font-medium text-gray-700'
                  >
                    সম্পূর্ণ ঠিকানা *
                  </label>
                  <input
                    type='text'
                    id='address'
                    name='address'
                    value={formData.address}
                    onChange={handleAddressChange} // Updated
                    onBlur={() => validateForm()}
                    className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='বাড়ি নং, রাস্তা নং, থানা, উপজেলা'
                  />
                  {errors.address && (
                    <p className='text-red-500 text-xs mt-1'>
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
              {/* Payment & Button */}
              <div className='space-y-4 mt-6'>
                <div className='bg-gray-100 p-4 rounded-lg text-sm text-gray-700'>
                  <p className='font-bold mb-1'>ক্যাশ অন ডেলিভারি</p>
                  <p>পণ্য হাতে পেয়ে মূল্য পরিশোধ করবেন।</p>
                </div>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='w-full flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-full text-lg shadow-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
                >
                  {isLoading ? (
                    'অর্ডার কনফার্ম হচ্ছে...'
                  ) : (
                    <>
                      <BsFillLockFill className='mr-2' />
                      <span>অর্ডার করুন {grandTotal}৳</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            {/* Right Column: Order Summary (on mobile, it's order-1) */}
            <div className=' p-4 md:p-6 bg-white rounded-lg border border-pink-400'>
              <h3 className='text-xl md:text-2xl font-bold mb-6 text-pink-700'>
                অর্ডারটি সম্পূর্ণ করুন
              </h3>

              {/* <div className='flex justify-around bg-pink-50 p-1 rounded-md mb-6 text-xs md:text-sm gap-2'>
                <button
                  type='button'
                  onClick={() => handleProductTypeChange('pink')} 
                  className={`flex-1 py-2 rounded-md font-semibold transition-colors duration-200 ${
                    selectedProductType === 'pink'
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'text-gray-700'
                  }`}
                >
                  Gluta Collagen Pink
                </button>
                <button
                  type='button'
                  onClick={() => handleProductTypeChange('plus')} 
                  className={`flex-1 py-2 rounded-md font-semibold transition-colors duration-200 ${
                    selectedProductType === 'plus'
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'text-gray-700'
                  }`}
                >
                  Gluta collagen +
                </button>
                <button
                  type='button'
                  onClick={() => handleProductTypeChange('red')} 
                  className={`flex-1 py-2 rounded-md font-semibold transition-colors duration-200 ${
                    selectedProductType === 'red'
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'text-gray-700'
                  }`}
                >
                  Red C Multivitamin
                </button>
              </div> */}

              {/* Product Selection */}
              <div className='space-y-4 mb-6'>
                {currentProducts.map((product) => (
                  <label
                    key={product.id}
                    className='flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all hover:bg-pink-50 has-[:checked]:bg-pink-100 has-[:checked]:border-pink-500'
                  >
                    <input
                      type='radio'
                      name='product'
                      value={product.id}
                      checked={selectedProductId === product.id}
                      onChange={() => {
                        setSelectedProductId(product.id);
                        trackEvent('product_select', {
                          product_id: product.id,
                        }); // Add this
                      }}
                      className='form-radio h-5 w-5 text-pink-600 focus:ring-pink-500'
                    />
                    <img
                      src={product.image}
                      alt={product.name}
                      className='w-16 h-16 object-cover rounded-md'
                    />
                    <div className='flex-1'>
                      <p className='text-sm font-semibold'>{product.name}</p>
                      <div className='flex items-center justify-start space-x-3'>
                        <p className='text-lg font-bold text-pink-700'>
                          {product.price}৳
                        </p>
                        {product.save && (
                          <p className='text-xs font-medium text-teal-700'>
                            *Save ৳{product.save}
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Order Totals */}
              <div className='border-t pt-4'>
                <div className='flex justify-between font-medium text-gray-800'>
                  <span>Subtotal</span>
                  <span>{subtotal}৳</span>
                </div>
                <div className='flex justify-between font-medium text-gray-800 mt-2'>
                  <span>Shipping Charge</span>
                  <span>{shippingCharge}৳</span>
                </div>
                <div className='flex justify-between font-bold text-lg text-pink-600 mt-4 border-t pt-2'>
                  <span>Total</span>
                  <span>{grandTotal}৳</span>
                </div>
              </div>
            </div>
            {/* Left Column: Billing Details (on mobile, it's order-2) */}
          </div>
        </form>
      </div>
      {showModal && (
        <OrderSuccessModal
          orderDetails={orderDetails}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default OrderForm;
