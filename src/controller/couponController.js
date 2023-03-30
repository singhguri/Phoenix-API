const CouponModel = require("../model/couponModel");

const getAllCoupons = async (req, res) => {
  try {
    const query = req.query;
    let coupons = [];

    coupons = query
      ? await CouponModel.find(query)
      : await CouponModel.find({});

    return res.status(200).send({
      status: true,
      message: coupons,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const insertCoupon = async (req, res) => {
  try {
    const body = req.body;

    const coupon = await CouponModel.create(body);

    return res.status(200).send({
      status: true,
      message: "Coupon added successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!couponId)
      return res.status(200).send({
        status: false,
        message: "Please provide valid coupon Id.",
      });

    const coupons = await CouponModel.findByIdAndDelete(couponId);

    return res.status(200).send({
      status: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateCouponUsers = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!couponId)
      return res.status(200).send({
        status: false,
        message: "Please provide valid parameters.",
      });

    const coupon = await CouponModel.findById(couponId);

    if (coupon.usersCount === coupon.maxUsersCount) {
      // delete the coupon
      coupon.delete();

      return res.status(200).send({
        status: false,
        message: "Coupon expired.",
      });
    } else {
      coupon.usersCount++;
      // console.log(coupon);
      const newCoupon = await CouponModel.findByIdAndUpdate(couponId, coupon, {
        new: true,
      });
    }

    return res.status(200).send({
      status: true,
      message: "Coupon updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  getAllCoupons,
  insertCoupon,
  deleteCoupon,
  updateCouponUsers,
};
