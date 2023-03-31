const CouponModel = require("../model/couponModel");
const fetch = require("node-fetch");

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

    if (!body)
      return res.status(200).send({
        status: false,
        message: "Please provide valid parameteres.",
      });

    const existCoupon = await CouponModel.findOne({
      description: body.description,
    });

    if (existCoupon)
      return res.status(200).send({
        status: false,
        message: "Coupon already exists.",
      });

    (async () => {
      const rawResponse = await fetch(
        process.env.PYTHON_TRANSLATE_API_BASE + "coupon/fr",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const resp = await rawResponse.json();
      console.log(resp);
      if (resp.status) {
        let FrCoupon = resp.message;

        // create english coupon
        const coupon = await CouponModel.create(body);

        // console.log(coupon);

        // create french coupon
        FrCoupon = { ...FrCoupon, enCouponId: coupon._id };
        const frcoupon = await CouponModel.create(FrCoupon);

        return res.status(200).send({
          status: true,
          message: "Coupon added successfully.",
        });
      }
    })();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { couponId, couponLang } = req.body;
    if (!couponId)
      return res.status(200).send({
        status: false,
        message: "Please provide valid coupon Id.",
      });

    if (couponLang === "en") {
      // delete french coupon
      const frCoupon = await CouponModel.findOneAndDelete({
        enCouponId: couponId,
      });
      // delete english coupon
      const coupon = await CouponModel.findByIdAndDelete(couponId);
    } else {
      // find french coupon
      const frCoupon = await CouponModel.findById(couponId);
      // delete english coupon
      const coupon = await CouponModel.findByIdAndDelete(frCoupon.enCouponId);
      // delete french coupon
      const deletedCoupon = await CouponModel.findByIdAndDelete(couponId);
    }
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
      const newCount = coupon.usersCount;
      if (coupon.lang === "en") {
        CouponModel.findOneAndUpdate(
          { enCouponId: couponId },
          { $set: { usersCount: newCount } },
          { new: true }
        );
        const newCoupon = await CouponModel.findByIdAndUpdate(
          couponId,
          coupon,
          {
            new: true,
          }
        );
      } else {
        // update fr coupon
        const newCoupon = await CouponModel.findByIdAndUpdate(
          couponId,
          coupon,
          {
            new: true,
          }
        );
        // update en coupon
        CouponModel.findByIdAndUpdate(
          coupon.enCouponId,
          { $set: { usersCount: newCount } },
          { new: true }
        );
      }
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
